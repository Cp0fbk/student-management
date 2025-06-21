import { BASE_URL } from '@/utils/Constant'
import axios from 'axios'

const clientAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 1000 * 60 * 10 // Set a timeout 10 mins
})

clientAxios.interceptors.request.use(
  (config) => {
    // Add any request interceptors here if needed
    return config
  },
  (error) => {
    // Handle request error
    return Promise.reject(error)
  }
)

clientAxios.interceptors.response.use(
  (response) => {
    // Handle response data
    return response
  },
  (error) => {
    // Handle response error
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response error:', error.response.data)
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request error:', error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default clientAxios
