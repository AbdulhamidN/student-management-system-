const EmptyState = ({ message, icon, action }) => {
    return (
        <div className="text-center py-12">
            <div className="text-6xl mb-4">{icon || '📭'}</div>
            <h3 className="text-xl font-semibold text-gray-700">{message || 'No data found'}</h3>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};
export default EmptyState;
