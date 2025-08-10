import React from 'react';

const LiquidityModal = ({
  isOpen,
  onRequestClose,
  selectedPool,
  actionType,
  showSuccess,
  submittedAmount,
  selectedToken,
  handleSubmit,
  setSelectedToken,
  parseTokens,
}) => {
  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      {!showSuccess ? (
        <>
          <h2>{actionType === 'add' ? 'Add' : 'Remove'} Liquidity</h2>
          <p>Pool: {selectedPool}</p>
          <form onSubmit={handleSubmit}>
            <input type="number" name="amount" placeholder="Amount" required />

            {selectedPool && (
              <>
                <p className="available-tokens">
                  Available Tokens in <strong>{selectedPool}</strong>: {parseTokens(selectedPool).join(', ')}
                </p>

                <label htmlFor="token">Select Token:</label>
                <select
                  id="token"
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  required
                >
                  {parseTokens(selectedPool).map((token, idx) => (
                    <option key={idx} value={token}>
                      {token}
                    </option>
                  ))}
                </select>
              </>
            )}

            <div className="modal-buttons">
              <button type="submit" disabled={showSuccess}>
                {actionType === 'add' ? 'Add' : 'Remove'}
              </button>
              <button type="button" onClick={onRequestClose}>
                Cancel
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="success-animation">
          <div className="checkmark">&#10003;</div>
          <p>
            {actionType === 'add' ? 'Added' : 'Removed'} {submittedAmount}{' '}
            <strong>{selectedToken}</strong> in <strong>{selectedPool}</strong>!
          </p>
        </div>
      )}
    </div>
  );
};

export default LiquidityModal;
