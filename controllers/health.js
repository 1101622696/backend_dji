const getHealth = async (req, res) => {
    try {
        res.status(200).json({ 
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'backend-active'
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
};

export default { getHealth };