import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Bot } from 'lucide-react';
import { forgotPassword } from '../services/auth.service';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setSuccessMsg('Nếu email đã tồn tại, Hệ thống đã gửi hướng dẫn đặt lại mật khẩu.');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || 'Không thể gửi yêu cầu vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      <div className="hidden lg:flex w-1/2 relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=2000"
          alt="Food planning"
          className="absolute inset-0 w-full h-full object-cover scale-105 transform hover:scale-100 transition-transform duration-10000 opacity-60"
        />
        <div className="absolute bottom-0 left-0 p-12 z-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Đặt lại
              <br />
              mật khẩu
            </h1>
            <p className="text-gray-300 text-lg max-w-md">
              Nhập email đã đăng kí, hệ thống sẽ gửi đường dẫn đặt lại mật khẩu cho bạn
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 lg:p-24 bg-gray-50/50">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100/80 text-blue-600 mb-6 shadow-sm">
              <Bot size={24} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quên mật khẩu</h2>
            <p className="mt-2 text-sm text-gray-500">Nhập email để nhận link đặt lại mật khẩu.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50/80 border border-red-100 text-red-600 text-sm rounded-xl"
              >
                {errorMsg}
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-50/80 border border-green-100 text-green-700 text-sm rounded-xl"
              >
                {successMsg}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-200 rounded-xl bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ${
                isLoading ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Đang gửi...' : (
                <>
                  Gửi link đặt lại
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center sm:text-left">
            <p className="text-sm text-gray-600">
              Nhớ mật khẩu rồi?{' '}
              <Link to="/login" className="font-semibold text-green-600 hover:text-green-500 transition-colors">
                Quay lại đăng nhập
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
