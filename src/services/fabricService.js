const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

class FabricService {
    constructor() {
        this.channelName = process.env.CHANNEL_NAME || 'mrvchannel';
        this.chaincodeName = process.env.CHAINCODE_NAME || 'mrvcc';
        this.walletPath = path.join(__dirname, '../../wallet');
        this.connectionProfilePath = path.join(__dirname, '../config/connection.json');
        this.basePath = path.resolve(__dirname, '../../..');
    }

    async getWallet() {
        const wallet = await Wallets.newFileSystemWallet(this.walletPath);
        return wallet;
    }

    async enrollAdmin() {
        try {
            const wallet = await this.getWallet();
            
            const adminIdentity = await wallet.get('admin');
            if (adminIdentity) {
                console.log('Admin identity already exists in wallet');
                return;
            }

            console.log('Importing admin identity from crypto materials...');
            
            const credPath = path.join(
                this.basePath,
                'organizations/peerOrganizations/ngo.com/users/Admin@ngo.com/msp'
            );
            
            const certPath = path.join(credPath, 'signcerts', 'Admin@ngo.com-cert.pem');
            const keyPath = path.join(credPath, 'keystore');
            
            console.log('Certificate path:', certPath);
            console.log('Keystore path:', keyPath);
            
            const certificate = fs.readFileSync(certPath, 'utf8');
            
            const keyFiles = fs.readdirSync(keyPath);
            const privateKeyPath = path.join(keyPath, keyFiles[0]);
            const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
            
            console.log('Successfully read certificate and private key');
            
            const x509Identity = {
                credentials: {
                    certificate: certificate,
                    privateKey: privateKey,
                },
                mspId: 'NGOMSP',
                type: 'X.509',
            };
            
            await wallet.put('admin', x509Identity);
            console.log('Successfully imported admin identity into wallet');
            
        } catch (error) {
            console.error(`Failed to import admin identity: ${error}`);
            throw error;
        }
    }

    async getContract(userName = 'admin') {
    try {
        const wallet = await this.getWallet();
        
        const identity = await wallet.get(userName);
        if (!identity) {
            throw new Error(`Identity ${userName} not found in wallet`);
        }

        const ccpPath = this.connectionProfilePath;
        const fileContent = fs.readFileSync(ccpPath, 'utf8');
        const ccp = JSON.parse(fileContent);
        
        const peerNgoTlsPath = path.join(this.basePath, 'organizations/peerOrganizations/ngo.com/peers/peer0.ngo.com/tls/ca.crt');
        const peerVerifierTlsPath = path.join(this.basePath, 'organizations/peerOrganizations/verifier.com/peers/peer0.verifier.com/tls/ca.crt');
        
        ccp.peers['peer0.ngo.com'].tlsCACerts.pem = fs.readFileSync(peerNgoTlsPath, 'utf8');
        ccp.peers['peer0.verifier.com'].tlsCACerts.pem = fs.readFileSync(peerVerifierTlsPath, 'utf8');
        
        const ordererTlsPath = path.join(this.basePath, 'organizations/ordererOrganizations/mrv-orderer.com/orderers/orderer.mrv-orderer.com/msp/tlscacerts/tlsca.mrv-orderer.com-cert.pem');
        ccp.orderers['orderer.mrv-orderer.com'].tlsCACerts.pem = fs.readFileSync(ordererTlsPath, 'utf8');

        console.log('Connecting to gateway with discovery disabled...');
        
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: userName,
            discovery: { 
                enabled: false,  // Completely disable discovery
                asLocalhost: true 
            },
            eventHandlerOptions: {
                commitTimeout: 100,
                strategy: null
            }
        });

        console.log('Connected to gateway, getting network...');
        
        const network = await gateway.getNetwork(this.channelName);
        const contract = network.getContract(this.chaincodeName);

        console.log('Contract obtained successfully');

        return { contract, gateway };
    } catch (error) {
        console.error(`Failed to get contract: ${error}`);
        throw error;
    }
}

    async submitTransaction(functionName, ...args) {
    let gateway;
    try {
        console.log(`Submitting transaction: ${functionName} with args:`, args);
        const { contract, gateway: gw } = await this.getContract();
        gateway = gw;
        
        // Simple submit without explicit peer selection
        const result = await contract.submitTransaction(functionName, ...args);
        await gateway.disconnect();
        
        console.log('Transaction submitted successfully');
        return result.toString();
    } catch (error) {
        console.error(`Transaction error: ${error.message}`);
        console.error('Full error:', error);
        if (gateway) await gateway.disconnect();
        throw error;
    }
}
    async evaluateTransaction(functionName, ...args) {
        let gateway;
        try {
            console.log(`Evaluating transaction: ${functionName}`);
            const { contract, gateway: gw } = await this.getContract();
            gateway = gw;
            
            const result = await contract.evaluateTransaction(functionName, ...args);
            await gateway.disconnect();
            
            console.log('Transaction evaluated successfully');
            return result.toString();
        } catch (error) {
            console.error(`Evaluation error: ${error}`);
            if (gateway) await gateway.disconnect();
            throw error;
        }
    }
}

module.exports = new FabricService();