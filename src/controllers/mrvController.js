const fabricService = require('../services/fabricService');

class MRVController {
    async submitMRV(req, res) {
        try {
            const { id, ngoId, location, carbonOffset, timestamp, submitter } = req.body;
            
            if (!id || !ngoId || !location || !carbonOffset || !submitter) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const finalTimestamp = timestamp || new Date().toISOString();

            await fabricService.submitTransaction(
                'SubmitMRV',
                id, ngoId, location, carbonOffset, finalTimestamp, submitter
            );

            res.status(201).json({ 
                success: true, 
                message: 'MRV data submitted successfully',
                mrvId: id
            });
        } catch (error) {
            console.error('Error submitting MRV:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getMRV(req, res) {
        try {
            const { id } = req.params;
            const result = await fabricService.evaluateTransaction('GetMRV', id);
            
            res.status(200).json(JSON.parse(result));
        } catch (error) {
            console.error('Error getting MRV:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getAllMRV(req, res) {
        try {
            const result = await fabricService.evaluateTransaction('GetAllMRV');
            const mrvData = result ? JSON.parse(result) : [];
            
            res.status(200).json(mrvData);
        } catch (error) {
            console.error('Error getting all MRV:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getMRVByNGO(req, res) {
        try {
            const { ngoId } = req.params;
            const result = await fabricService.evaluateTransaction('GetAllMRV');
            const allMRV = result ? JSON.parse(result) : [];
            
            // Filter by NGO ID
            const ngoMRV = allMRV.filter(mrv => mrv.ngoId === ngoId);
            
            res.status(200).json(ngoMRV);
        } catch (error) {
            console.error('Error getting MRV by NGO:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new MRVController();
