import AppIcon from '../ui/AppIcon';

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center">
        <AppIcon className="w-8 h-8 mr-2" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          GitGauge
        </h1>
      </div>
    </header>
  );
}