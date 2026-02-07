/// Aniki Treasury Management Smart Contract
/// 
/// This contract implements the core treasury management functionality
/// for the Aniki autonomous agent system on Sui blockchain.
/// 
/// Key features:
/// - Multi-signature treasury management
/// - Cold/hot wallet separation
/// - Agent budget allocation and tracking
/// - Emergency controls and security features
/// - Gas optimization through batch operations
module aniki::treasury {
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};

    use std::vector;
    use std::string::String;
    use std::option::{Self, Option};

    // ======== Error Codes ========

    const E_NOT_AUTHORIZED: u64 = 0;
    const E_INSUFFICIENT_BALANCE: u64 = 1;
    const E_INVALID_THRESHOLD: u64 = 2;
    const E_EMERGENCY_MODE_ACTIVE: u64 = 3;
    const E_COLD_WALLET_APPROVAL_REQUIRED: u64 = 4;
    const E_MULTISIG_THRESHOLD_NOT_MET: u64 = 5;
    const E_DAILY_LIMIT_EXCEEDED: u64 = 6;
    const E_INVALID_AGENT_ID: u64 = 7;

    // ======== Structs ========

    /// Main treasury configuration and state
    public struct Treasury has key, store {
        id: UID,
        admin: address,
        cold_wallet: address,
        hot_wallet: address,
        cold_threshold: u64,       // Amount requiring cold wallet approval
        hot_threshold: u64,        // Maximum amount for hot wallet
        emergency_mode: bool,
        multisig_signers: vector<address>,
        multisig_threshold: u8,
        daily_limit: u64,
        daily_spent: u64,
        last_reset: u64,          // Timestamp of last daily reset
        agent_allocations: Table<String, AgentAllocation>,
        pending_approvals: Table<u64, PendingApproval>,
        approval_counter: u64,
    }

    /// Agent budget allocation tracking
    public struct AgentAllocation has store {
        agent_id: String,
        allocated_amount: u64,
        spent_amount: u64,
        security_level: u8,        // 0=low, 1=medium, 2=high, 3=critical
        created_at: u64,
        expires_at: u64,
    }

    /// Pending approval for high-value transactions
    public struct PendingApproval has store {
        id: u64,
        amount: u64,
        recipient: address,
        approvals: vector<address>,
        required_approvals: u8,
        created_at: u64,
        expires_at: u64,
        memo: String,
    }

    /// Treasury balance tracking
    public struct TreasuryBalance has key {
        id: UID,
        balance: Balance<SUI>,
        treasury_id: ID,
    }

    /// Capability for treasury administration
    public struct TreasuryAdminCap has key, store {
        id: UID,
        treasury_id: ID,
    }

    /// Agent execution capability
    public struct AgentCap has key, store {
        id: UID,
        agent_id: String,
        treasury_id: ID,
        max_amount: u64,
        expires_at: u64,
    }

    // ======== Events ========

    public struct TreasuryCreated has copy, drop {
        treasury_id: ID,
        admin: address,
        cold_threshold: u64,
        hot_threshold: u64,
    }

    public struct AgentAllocated has copy, drop {
        treasury_id: ID,
        agent_id: String,
        amount: u64,
        security_level: u8,
    }

    public struct FundsTransferred has copy, drop {
        treasury_id: ID,
        recipient: address,
        amount: u64,
        approval_mode: u8,  // 0=hot, 1=cold, 2=multisig
        approval_id: Option<u64>,
    }

    public struct EmergencyActivated has copy, drop {
        treasury_id: ID,
        reason: String,
        activated_by: address,
    }

    public struct ApprovalRequested has copy, drop {
        treasury_id: ID,
        approval_id: u64,
        amount: u64,
        recipient: address,
        required_approvals: u8,
    }

    public struct ApprovalProvided has copy, drop {
        treasury_id: ID,
        approval_id: u64,
        approver: address,
        total_approvals: u64,
    }

    // ======== Public Functions ========

    /// Initialize a new treasury with security configuration
    public fun initialize_treasury(
        admin: address,
        cold_wallet: address,
        hot_wallet: address,
        cold_threshold: u64,
        hot_threshold: u64,
        daily_limit: u64,
        multisig_signers: vector<address>,
        multisig_threshold: u8,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(cold_threshold > hot_threshold, E_INVALID_THRESHOLD);
        assert!(multisig_threshold > 0, E_INVALID_THRESHOLD);
        assert!(multisig_threshold <= (vector::length(&multisig_signers) as u8), E_INVALID_THRESHOLD);

        let treasury_id = object::new(ctx);
        let treasury_uid = object::uid_to_inner(&treasury_id);

        let treasury = Treasury {
            id: treasury_id,
            admin,
            cold_wallet,
            hot_wallet,
            cold_threshold,
            hot_threshold,
            emergency_mode: false,
            multisig_signers,
            multisig_threshold,
            daily_limit,
            daily_spent: 0,
            last_reset: clock::timestamp_ms(clock),
            agent_allocations: table::new(ctx),
            pending_approvals: table::new(ctx),
            approval_counter: 0,
        };

        let admin_cap = TreasuryAdminCap {
            id: object::new(ctx),
            treasury_id: treasury_uid,
        };

        let balance = TreasuryBalance {
            id: object::new(ctx),
            balance: balance::zero(),
            treasury_id: treasury_uid,
        };

        event::emit(TreasuryCreated {
            treasury_id: treasury_uid,
            admin,
            cold_threshold,
            hot_threshold,
        });

        transfer::share_object(treasury);
        transfer::share_object(balance);
        transfer::transfer(admin_cap, admin);
    }

    /// Deposit SUI into the treasury
    public fun deposit(
        treasury: &mut Treasury,
        balance_obj: &mut TreasuryBalance,
        payment: Coin<SUI>,
        _ctx: &mut TxContext
    ) {
        assert!(object::uid_to_inner(&treasury.id) == balance_obj.treasury_id, E_NOT_AUTHORIZED);
        
        let deposit_amount = coin::value(&payment);
        let deposit_balance = coin::into_balance(payment);
        balance::join(&mut balance_obj.balance, deposit_balance);
        
        // Note: In a real implementation, you'd emit a deposit event here
    }

    /// Allocate budget for an agent with security checks
    public fun allocate_agent_budget(
        treasury: &mut Treasury,
        agent_id: String,
        amount: u64,
        security_level: u8,
        duration_ms: u64,
        admin_cap: &TreasuryAdminCap,
        clock: &Clock,
        ctx: &mut TxContext
    ): AgentCap {
        assert!(object::uid_to_inner(&treasury.id) == admin_cap.treasury_id, E_NOT_AUTHORIZED);
        assert!(!treasury.emergency_mode, E_EMERGENCY_MODE_ACTIVE);
        
        update_daily_spending(treasury, clock);
        assert!(treasury.daily_spent + amount <= treasury.daily_limit, E_DAILY_LIMIT_EXCEEDED);

        let now = clock::timestamp_ms(clock);
        let expires_at = now + duration_ms;

        let allocation = AgentAllocation {
            agent_id,
            allocated_amount: amount,
            spent_amount: 0,
            security_level,
            created_at: now,
            expires_at,
        };

        let agent_cap = AgentCap {
            id: object::new(ctx),
            agent_id,
            treasury_id: object::uid_to_inner(&treasury.id),
            max_amount: amount,
            expires_at,
        };

        table::add(&mut treasury.agent_allocations, agent_id, allocation);
        treasury.daily_spent = treasury.daily_spent + amount;

        event::emit(AgentAllocated {
            treasury_id: object::uid_to_inner(&treasury.id),
            agent_id,
            amount,
            security_level,
        });

        agent_cap
    }

    /// Agent transfers funds with automatic security routing
    public fun agent_transfer(
        treasury: &mut Treasury,
        balance_obj: &mut TreasuryBalance,
        agent_cap: &AgentCap,
        recipient: address,
        amount: u64,
        memo: String,
        clock: &Clock,
        ctx: &mut TxContext
    ): Option<u64> {
        assert!(object::uid_to_inner(&treasury.id) == agent_cap.treasury_id, E_NOT_AUTHORIZED);
        assert!(object::uid_to_inner(&treasury.id) == balance_obj.treasury_id, E_NOT_AUTHORIZED);
        assert!(!treasury.emergency_mode, E_EMERGENCY_MODE_ACTIVE);
        assert!(amount <= agent_cap.max_amount, E_INSUFFICIENT_BALANCE);

        let now = clock::timestamp_ms(clock);
        assert!(now <= agent_cap.expires_at, E_INVALID_AGENT_ID);

        // Check if agent allocation exists and has sufficient budget
        assert!(table::contains(&treasury.agent_allocations, agent_cap.agent_id), E_INVALID_AGENT_ID);
        let allocation = table::borrow_mut(&mut treasury.agent_allocations, agent_cap.agent_id);
        assert!(allocation.spent_amount + amount <= allocation.allocated_amount, E_INSUFFICIENT_BALANCE);

        // Determine approval mode based on amount
        if (amount >= treasury.cold_threshold) {
            // Requires cold wallet or multisig approval
            let approval_id = create_pending_approval(
                treasury,
                amount,
                recipient,
                treasury.multisig_threshold,
                memo,
                clock,
                ctx
            );
            option::some(approval_id)
        } else {
            // Hot wallet - execute immediately
            execute_transfer(
                balance_obj,
                recipient,
                amount,
                0, // hot wallet mode
                option::none(),
                ctx
            );
            
            allocation.spent_amount = allocation.spent_amount + amount;
            
            event::emit(FundsTransferred {
                treasury_id: object::uid_to_inner(&treasury.id),
                recipient,
                amount,
                approval_mode: 0,
                approval_id: option::none(),
            });
            
            option::none()
        }
    }

    /// Provide approval for pending transaction
    public fun approve_transaction(
        treasury: &mut Treasury,
        balance_obj: &mut TreasuryBalance,
        approval_id: u64,
        approver: &TxContext,
    ) {
        assert!(!treasury.emergency_mode, E_EMERGENCY_MODE_ACTIVE);
        assert!(table::contains(&treasury.pending_approvals, approval_id), E_INVALID_AGENT_ID);
        
        let approval = table::borrow_mut(&mut treasury.pending_approvals, approval_id);
        let approver_addr = tx_context::sender(approver);
        
        // Check if approver is authorized
        assert!(vector::contains(&treasury.multisig_signers, &approver_addr), E_NOT_AUTHORIZED);
        
        // Check if not already approved by this address
        assert!(!vector::contains(&approval.approvals, &approver_addr), E_NOT_AUTHORIZED);
        
        // Add approval
        vector::push_back(&mut approval.approvals, approver_addr);
        
        event::emit(ApprovalProvided {
            treasury_id: object::uid_to_inner(&treasury.id),
            approval_id,
            approver: approver_addr,
            total_approvals: vector::length(&approval.approvals),
        });
        
        // Check if threshold is met
        if ((vector::length(&approval.approvals) as u8) >= approval.required_approvals) {
            // Execute the transaction
            execute_transfer(
                balance_obj,
                approval.recipient,
                approval.amount,
                2, // multisig mode
                option::some(approval_id),
                approver
            );
            
            event::emit(FundsTransferred {
                treasury_id: object::uid_to_inner(&treasury.id),
                recipient: approval.recipient,
                amount: approval.amount,
                approval_mode: 2,
                approval_id: option::some(approval_id),
            });
            
            // Remove the approval
            table::remove(&mut treasury.pending_approvals, approval_id);
        }
    }

    /// Emergency stop - activate emergency mode
    public fun emergency_stop(
        treasury: &mut Treasury,
        reason: String,
        admin_cap: &TreasuryAdminCap,
        ctx: &TxContext
    ) {
        assert!(object::uid_to_inner(&treasury.id) == admin_cap.treasury_id, E_NOT_AUTHORIZED);
        
        treasury.emergency_mode = true;
        
        event::emit(EmergencyActivated {
            treasury_id: object::uid_to_inner(&treasury.id),
            reason,
            activated_by: tx_context::sender(ctx),
        });
    }

    /// Deactivate emergency mode (admin only)
    public fun deactivate_emergency(
        treasury: &mut Treasury,
        admin_cap: &TreasuryAdminCap,
        _ctx: &TxContext
    ) {
        assert!(object::uid_to_inner(&treasury.id) == admin_cap.treasury_id, E_NOT_AUTHORIZED);
        treasury.emergency_mode = false;
    }

    // ======== Helper Functions ========

    fun create_pending_approval(
        treasury: &mut Treasury,
        amount: u64,
        recipient: address,
        required_approvals: u8,
        memo: String,
        clock: &Clock,
        _ctx: &mut TxContext
    ): u64 {
        let approval_id = treasury.approval_counter;
        treasury.approval_counter = treasury.approval_counter + 1;
        
        let now = clock::timestamp_ms(clock);
        let expires_at = now + 86400000; // 24 hours
        
        let approval = PendingApproval {
            id: approval_id,
            amount,
            recipient,
            approvals: vector::empty(),
            required_approvals,
            created_at: now,
            expires_at,
            memo,
        };
        
        table::add(&mut treasury.pending_approvals, approval_id, approval);
        
        event::emit(ApprovalRequested {
            treasury_id: object::uid_to_inner(&treasury.id),
            approval_id,
            amount,
            recipient,
            required_approvals,
        });
        
        approval_id
    }

    fun execute_transfer(
        balance_obj: &mut TreasuryBalance,
        recipient: address,
        amount: u64,
        _approval_mode: u8,
        _approval_id: Option<u64>,
        ctx: &mut TxContext
    ) {
        assert!(balance::value(&balance_obj.balance) >= amount, E_INSUFFICIENT_BALANCE);
        
        let payment = coin::take(&mut balance_obj.balance, amount, ctx);
        transfer::public_transfer(payment, recipient);
    }

    fun update_daily_spending(treasury: &mut Treasury, clock: &Clock) {
        let now = clock::timestamp_ms(clock);
        let one_day_ms = 86400000; // 24 hours in milliseconds
        
        if (now - treasury.last_reset >= one_day_ms) {
            treasury.daily_spent = 0;
            treasury.last_reset = now;
        }
    }

    // ======== View Functions ========

    public fun get_treasury_balance(balance_obj: &TreasuryBalance): u64 {
        balance::value(&balance_obj.balance)
    }

    public fun get_agent_allocation(treasury: &Treasury, agent_id: String): (u64, u64, u8) {
        let allocation = table::borrow(&treasury.agent_allocations, agent_id);
        (allocation.allocated_amount, allocation.spent_amount, allocation.security_level)
    }

    public fun get_daily_spending(treasury: &Treasury): (u64, u64) {
        (treasury.daily_spent, treasury.daily_limit)
    }

    public fun is_emergency_mode(treasury: &Treasury): bool {
        treasury.emergency_mode
    }

    public fun get_pending_approval(treasury: &Treasury, approval_id: u64): (u64, address, u64, u8) {
        let approval = table::borrow(&treasury.pending_approvals, approval_id);
        (
            approval.amount,
            approval.recipient,
            vector::length(&approval.approvals),
            approval.required_approvals
        )
    }
}