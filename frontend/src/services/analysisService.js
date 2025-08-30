import axiosInstance from '../lib/axios.js';

const API_BASE_URL = 'https://privacy-policy-analyser.onrender.com'; //Very very bad, but for testing. Please look here for any errors.

export const analyzePolicyWithAPI = async (serviceName, policyText) => {
  try {
    const response = await axiosInstance.post(`/api/analyze`, {
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
    const response = await axiosInstance.post(`/api/extract-policy`, {
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
