import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const bufferService = {
  /**
   * Get buffered telemetry records
   */
  async getBufferedRecords() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/buffer/telemetry/latest`);
      return response.data.buffer || [];
    } catch (error) {
      console.error('Error fetching buffered records:', error);
      return [];
    }
  },

  /**
   * Mark records as synced
   */
  async markSynced(recordIds) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/buffer/telemetry/mark-synced`,
        { ids: recordIds }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking records as synced:', error);
      return null;
    }
  },

  /**
   * Flush synced records
   */
  async flushBuffer() {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/buffer/telemetry/flush`);
      return response.data;
    } catch (error) {
      console.error('Error flushing buffer:', error);
      return null;
    }
  },
};
