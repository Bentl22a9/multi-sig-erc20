// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;
import {SelfAuthorized} from "../common/SelfAuthorized.sol";
import {IOwnerManager} from "../interfaces/IOwnerManager.sol";

/**
 * @title OwnerManager - Manages Safe owners and a threshold to authorize transactions.
 * @dev Uses a linked list to store the owners because the code generate by the solidity compiler
 *      is more efficient than using a dynamic array.
 * @author Stefan George - @Georgi87
 * @author Richard Meissner - @rmeissner
 */
abstract contract OwnerManager is SelfAuthorized, IOwnerManager {
    address internal constant SENTINEL_OWNERS = address(0x1);

    mapping(address => address) internal owners;
    uint256 internal ownerCount;
    uint256 internal threshold;

    /**
     * @notice Sets the initial storage of the contract.
     * @param _owners List of Safe owners.
     * @param _threshold Number of required confirmations for a Safe transaction.
     */
    function setupOwners(address[] memory _owners, uint256 _threshold) internal {
        // Threshold can only be 0 at initialization.
        // Check ensures that setup function can only be called once.
        if (threshold > 0) revertWithError("GS200");
        // Validate that threshold is smaller than number of added owners.
        if (_threshold > _owners.length) revertWithError("GS201");
        // There has to be at least one Safe owner.
        if (_threshold == 0) revertWithError("GS202");
        // Initializing Safe owners.
        address currentOwner = SENTINEL_OWNERS;
        for (uint256 i = 0; i < _owners.length; i++) {
            // Owner address cannot be null.
            address owner = _owners[i];
            if (owner == address(0) || owner == SENTINEL_OWNERS || owner == address(this) || currentOwner == owner)
                revertWithError("GS203");
            // No duplicate owners allowed.
            if (owners[owner] != address(0)) revertWithError("GS204");
            owners[currentOwner] = owner;
            currentOwner = owner;
        }
        owners[currentOwner] = SENTINEL_OWNERS;
        ownerCount = _owners.length;
        threshold = _threshold;
    }

    /**
     * @inheritdoc IOwnerManager
     */
    function addOwnerWithThreshold(address owner, uint256 _threshold) public override authorized {
        // Owner address cannot be null, the sentinel or the Safe itself.
        if (owner == address(0) || owner == SENTINEL_OWNERS || owner == address(this)) revertWithError("GS203");
        // No duplicate owners allowed.
        if (owners[owner] != address(0)) revertWithError("GS204");
        owners[owner] = owners[SENTINEL_OWNERS];
        owners[SENTINEL_OWNERS] = owner;
        ownerCount++;
        emit AddedOwner(owner);
        // Change threshold if threshold was changed.
        if (threshold != _threshold) changeThreshold(_threshold);
    }

    /**
     * @inheritdoc IOwnerManager
     */
    function removeOwner(address prevOwner, address owner, uint256 _threshold) public override authorized {
        // Only allow to remove an owner, if threshold can still be reached.
        if (ownerCount - 1 < _threshold) revertWithError("GS201");
        // Validate owner address and check that it corresponds to owner index.
        if (owner == address(0) || owner == SENTINEL_OWNERS) revertWithError("GS203");
        if (owners[prevOwner] != owner) revertWithError("GS205");
        owners[prevOwner] = owners[owner];
        owners[owner] = address(0);
        ownerCount--;
        emit RemovedOwner(owner);
        // Change threshold if threshold was changed.
        if (threshold != _threshold) changeThreshold(_threshold);
    }

    /**
     * @inheritdoc IOwnerManager
     */
    function swapOwner(address prevOwner, address oldOwner, address newOwner) public override authorized {
        // Owner address cannot be null, the sentinel or the Safe itself.
        if (newOwner == address(0) || newOwner == SENTINEL_OWNERS || newOwner == address(this)) revertWithError("GS203");
        // No duplicate owners allowed.
        if (owners[newOwner] != address(0)) revertWithError("GS204");
        // Validate oldOwner address and check that it corresponds to owner index.
        if (oldOwner == address(0) || oldOwner == SENTINEL_OWNERS) revertWithError("GS203");
        if (owners[prevOwner] != oldOwner) revertWithError("GS205");
        owners[newOwner] = owners[oldOwner];
        owners[prevOwner] = newOwner;
        owners[oldOwner] = address(0);
        emit RemovedOwner(oldOwner);
        emit AddedOwner(newOwner);
    }

    /**
     * @inheritdoc IOwnerManager
     */
    function changeThreshold(uint256 _threshold) public override authorized {
        // Validate that threshold is smaller than number of owners.
        if (_threshold > ownerCount) revertWithError("GS201");
        // There has to be at least one Safe owner.
        if (_threshold == 0) revertWithError("GS202");
        threshold = _threshold;
        emit ChangedThreshold(threshold);
    }

    /**
     * @inheritdoc IOwnerManager
     */
    function getThreshold() public view override returns (uint256) {
        return threshold;
    }

    /**
     * @inheritdoc IOwnerManager
     */
    function isOwner(address owner) public view override returns (bool) {
        return !(owner == SENTINEL_OWNERS || owners[owner] == address(0));
    }

    /**
     * @inheritdoc IOwnerManager
     */
    function getOwners() public view override returns (address[] memory) {
        address[] memory array = new address[](ownerCount);

        // populate return array
        uint256 index = 0;
        address currentOwner = owners[SENTINEL_OWNERS];
        while (currentOwner != SENTINEL_OWNERS) {
            array[index] = currentOwner;
            currentOwner = owners[currentOwner];
            index++;
        }
        return array;
    }
}
