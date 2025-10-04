const fabricService = require('../services/fabricService');

class NGOController {
    async registerNGO(req, res) {
        try {
            const { id, name, contactEmail, country, projectType, description } = req.body;
            
            if (!id || !name || !contactEmail || !country || !projectType || !description) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            await fabricService.submitTransaction(
                'RegisterNGORequest',
                id, name, contactEmail, country, projectType, description
            );

            res.status(201).json({ 
                success: true, 
                message: 'NGO registration request submitted',
                ngoId: id
            });
        } catch (error) {
            console.error('Error registering NGO:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getNGO(req, res) {
        try {
            const { id } = req.params;
            const result = await fabricService.evaluateTransaction('GetNGORegistration', id);
            
            res.status(200).json(JSON.parse(result));
        } catch (error) {
            console.error('Error getting NGO:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getPendingRegistrations(req, res) {
        try {
            const result = await fabricService.evaluateTransaction('GetPendingRegistrations');
            const registrations = result ? JSON.parse(result) : [];
            
            res.status(200).json(registrations);
        } catch (error) {
            console.error('Error getting pending registrations:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async approveNGO(req, res) {
        try {
            const { id } = req.params;
            const { approver, notes } = req.body;

            if (!approver) {
                return res.status(400).json({ error: 'Approver name is required' });
            }

            await fabricService.submitTransaction('ApproveNGO', id, approver, notes || '');

            res.status(200).json({ 
                success: true, 
                message: 'NGO approved successfully',
                ngoId: id
            });
        } catch (error) {
            console.error('Error approving NGO:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async rejectNGO(req, res) {
        try {
            const { id } = req.params;
            const { approver, reason } = req.body;

            if (!approver || !reason) {
                return res.status(400).json({ error: 'Approver name and reason are required' });
            }

            await fabricService.submitTransaction('RejectNGO', id, approver, reason);

            res.status(200).json({ 
                success: true, 
                message: 'NGO rejected',
                ngoId: id
            });
        } catch (error) {
            console.error('Error rejecting NGO:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new NGOController();
