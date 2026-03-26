import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function ErrorPage() {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState(
        "Something went wrong. Please try again or contact support."
    );

    useEffect(() => {
        const msg = searchParams.get("msg");
        if (msg) setMessage(msg);
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex flex-col items-center justify-center p-6">
            <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-lg w-full text-center space-y-6">
                <XCircle className="w-20 h-20 text-red-600 mx-auto animate-bounce" />
                <h1 className="text-3xl font-extrabold text-gray-900">Oops! Something went wrong</h1>
                <p className="text-gray-600 text-lg">{message}</p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">

                    <a
                        href="mailto:support@yourapp.com"
                        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
                    >
                        Contact Support
                    </a>
                </div>

                <p className="mt-6 text-sm text-gray-400">
                    If you keep seeing this error, note the error message and contact our support team.
                </p>
            </div>
        </div>
    );
}
