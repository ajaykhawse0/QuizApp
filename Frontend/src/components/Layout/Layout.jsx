import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const hideFooter=window.location.pathname.startsWith('/quiz/');
  return (
    <div className="min-h-screen bg-background transition-colors duration-300 flex flex-col relative">
      <Navbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {children}
      </main>
      {!hideFooter && <Footer />}
      
    </div>
  );
};

export default Layout;
