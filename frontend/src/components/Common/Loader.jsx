const Loader = () => {
    return (
        <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
    );
};
export default Loader;
