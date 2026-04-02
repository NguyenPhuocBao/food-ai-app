import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Food AI System API running on http://localhost:${PORT}`);
  console.log(`📊 Total endpoints: 60+`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`🍽️  Foods: http://localhost:${PORT}/api/foods`);
  console.log(`📝 Meals: http://localhost:${PORT}/api/meals`);
  console.log(`📈 Statistics: http://localhost:${PORT}/api/statistics`);
  console.log(`💬 Chatbot: http://localhost:${PORT}/api/chat`);
  console.log(`👑 Admin: http://localhost:${PORT}/api/admin`);
});