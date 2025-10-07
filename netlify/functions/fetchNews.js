const axios = require('axios');

exports.handler = async function(event, context) {
   
  const { category } = event.queryStringParameters;
  
   
  const API_KEY = process.env.VITE_API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'API key is not set.' })
    };
  }

  const API_URL = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`;

  try {
    const response = await axios.get(API_URL);
    
    return {
      statusCode: 200,
      body: JSON.stringify(response.data) // NewsAPI se mila data frontend ko bhej do
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ message: error.message })
    };
  }
};