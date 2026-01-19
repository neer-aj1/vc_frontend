const IncomingCall = ({ from, accept, reject }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 flex flex-col gap-2 w-64 z-50">
      <p className="font-medium text-gray-800">Incoming call from:</p>
      <p className="font-bold text-gray-900 truncate">{from}</p>
      <div className="flex justify-end gap-2 mt-2">
        <button
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          onClick={accept}
        >
          Accept
        </button>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          onClick={reject}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default IncomingCall;