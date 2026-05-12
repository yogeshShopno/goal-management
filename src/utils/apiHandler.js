import toast from 'react-hot-toast';

/**
 * Wraps any async API call with loading, success toast, and error toast.
 * @param {Function} apiFn     — async function that returns data
 * @param {Object}   options
 *   @param {string}   options.successMsg  — toast on success (optional)
 *   @param {string}   options.errorMsg    — override error toast (optional)
 *   @param {Function} options.setLoading  — loading state setter (optional)
 *   @param {Function} options.onSuccess   — callback on success
 *   @param {Function} options.onError     — callback on error
 */
export async function apiHandler(apiFn, options = {}) {
  const { successMsg, errorMsg, setLoading, onSuccess, onError } = options;
  try {
    if (setLoading) setLoading(true);
    const data = await apiFn();
    if (successMsg) toast.success(successMsg);
    if (onSuccess) onSuccess(data);
    return { data, error: null };
  } catch (err) {
    const msg = errorMsg || err?.message || 'An error occurred';
    toast.error(msg);
    if (onError) onError(err);
    return { data: null, error: err };
  } finally {
    if (setLoading) setLoading(false);
  }
}
