import mongoose from 'mongoose';

const gundamSchema = new mongoose.Schema({
        name: {type:String, required:true},
        title: {type:String},
        origin: {type:String},
        grade: {type:String, required:true},
        scale: {type:String, required:true},
        unitType: {type:String},
        description: {type:String},
        imageUrl: {type:String},
        hasBookmark: {type:Boolean, default: false},
        date:{type: Date, default: Date.now},
    },
    {
        toJSON:{
            virtuals:true,
            versionKey:false,
            transform: (doc, ret) => {
                ret._links = {
                    self:{ //DO=${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/spots/${ret.id}
                        href:`http://145.24.237.238:${process.env.EXPRESS_PORT}/gunpla/${ret.id}`,
                    },
                    collection: {
                        href: `http://145.24.237.238:${process.env.EXPRESS_PORT}/gunpla`,
                    },
                };

                delete ret._id;
            },
        },
    }
);

const Gundam = mongoose.model('Gundam', gundamSchema);

export default Gundam;