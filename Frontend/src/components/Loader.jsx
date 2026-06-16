export default function Loader() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-8">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white border-r-white animate-spin"
                        style={{ animationDuration: '2s' }}></div>
                    <div className="absolute inset-3 rounded-full border-2 border-transparent border-b-blue-500 border-l-blue-500 animate-spin"
                        style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                </div>
                <p className="text-gray-300 text-lg font-medium">Loading...</p>
                <div className="flex gap-3">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    );
}