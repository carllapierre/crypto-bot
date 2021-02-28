const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({

    userID: {
        type: String,
        trim: true,
        index: true,
        unique: true,
    },
    holding: {
        type: Map,
        of: Number
    },
    preferences: {
      currency: {
        type: String,
        default: 'CAD'
      }
    }
}, {
    timestamps: true,
});

walletSchema.statics = {

  async get(id) {
      try {
        
        let wallet;
  
        wallet = await this.findOne({ 'userID' : id }).exec();
        
        if (wallet) {
          return wallet;
        }
  
      } catch (error) {
        throw error;
      }
    }

}

module.exports = mongoose.model('Wallet', walletSchema);