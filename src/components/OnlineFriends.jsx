const OnlineFriends = ({ friends, onCall }) => {
    if (!friends.length) {
        return <p>No friends online</p>;
    }

    return (
        <div className="space-y-2">
            {friends.map((friend) => (
                <div
                    key={friend.userId}
                    className="flex justify-between items-center border rounded p-2"
                >
                    <div>
                        <p className="font-semibold">{friend.email}</p>
                        <p className="text-xs text-gray-500">{friend.userId}</p>
                    </div>
                    <button
                        className="border px-3 py-1 rounded hover:bg-gray-100"
                        onClick={() => onCall(friend.userId)}
                    >
                        Call
                    </button>
                </div>
            ))}
        </div>
    );
};

export default OnlineFriends;
