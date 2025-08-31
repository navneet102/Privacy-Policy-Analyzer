import axiosInstance from '../lib/axios.js';

const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction ? '' : 'http://localhost:5000';

export const analyzePolicyWithAPI = async (serviceName, policyText) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/api/analyze`, {
      serviceName,
      policyText
    });
    
    return response.data;
  } catch (error) {
    console.error("Error calling analysis API:", error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(`Failed to communicate with analysis service: ${error.message || 'Unknown error'}`);
  }
};

export const extractPolicyFromService = async (serviceName) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/api/extract-policy`, {
      serviceName
    });
    
    return response.data;
  } catch (error) {
    console.error("Error calling policy extraction API:", error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(`Failed to extract policy automatically: ${error.message || 'Unknown error'}`);
  }
};
