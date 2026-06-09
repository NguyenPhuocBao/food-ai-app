import { AlertTriangle, ArrowLeft, Compass, Home } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const homePath = isAdminRoute ? '/admin' : '/';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_20%,#d1fae5_0%,#f8fafc_42%,#e0f2fe_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-emerald-300/40 blur-3xl" />
      <div className="pointer-events-none absolute top-20 -right-24 h-80 w-80 rounded-full bg-sky-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-96 w-96 rounded-full bg-amber-200/45 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-4xl items-center justify-center">
        <div className="w-full rounded-[32px] border border-white/70 bg-white/70 p-8 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl md:p-10">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                <AlertTriangle size={14} />
                {isEn ? 'Error 404' : 'Lỗi 404'}
              </div>

              <p className="text-7xl font-black leading-none tracking-tight text-slate-900 sm:text-8xl">
                404
              </p>
              <h1 className="mt-4 text-3xl font-black text-gray-900 sm:text-4xl">
                {isEn ? 'Page Not Found' : 'Không tìm thấy trang'}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
                {isEn
                  ? 'The page may have been moved, deleted, or the URL is not valid. You can go back or return to the home page.'
                  : 'Trang có thể đã bị đổi đường dẫn, bị xóa hoặc URL không hợp lệ. Bạn có thể quay lại hoặc về trang chủ.'}
              </p>

              <div className="mt-4 rounded-2xl border border-gray-200/80 bg-white/70 px-4 py-3 text-xs text-gray-500 sm:text-sm">
                <span className="font-semibold text-gray-700">{isEn ? 'Requested URL:' : 'URL đang truy cập:'}</span>{' '}
                <span className="break-all">{location.pathname}</span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/80 bg-white/75 p-5 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                <Compass size={22} />
              </div>
              <p className="text-lg font-black text-gray-900">
                {isEn ? 'Quick Navigation' : 'Điều hướng nhanh'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {isEn ? 'Choose an action to continue using the app.' : 'Chọn thao tác để tiếp tục sử dụng ứng dụng.'}
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (window.history.length > 1) {
                      navigate(-1);
                      return;
                    }
                    navigate(homePath);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  <ArrowLeft size={16} />
                  {isEn ? 'Go Back' : 'Quay lại'}
                </button>

                <Link
                  to={homePath}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2.5 text-sm font-bold text-white transition hover:from-emerald-600 hover:to-sky-600"
                >
                  <Home size={16} />
                  {isEn ? 'Back to Home' : 'Về trang chủ'}
                </Link>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
