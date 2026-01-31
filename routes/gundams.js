import express from 'express';
import Gundam from '../models/Gundam.js';
import {faker} from '@faker-js/faker';

const router = express.Router();

router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

router.options('/', (req,res) => {
    res.header('allow', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send();
});

router.get('/', async (req, res) => {
    const gundams = await Gundam.find();

    res.json({
        items: gundams.map(gundam => ({
            id: gundam._id,
            name: gundam.name,
            grade: gundam.grade,
            scale: gundam.scale,

            _links: {
                self: {
                    href: `http://145.24.237.238:${process.env.EXPRESS_PORT}/gunpla/${gundam._id}`
                }
            }
        })),
        _links: {
            self: {
                href: `http://145.24.237.238:${process.env.EXPRESS_PORT}/gunpla`
            },
            collection: {
                href: `http://145.24.237.238:${process.env.EXPRESS_PORT}/gunpla`
            }
        }
    });
});

router.options('/:id', (req,res) => {
    res.header('Allow', 'GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.status(204).send();
});

router.get('/:id', async(req, res) => {
    const gundam = await Gundam.findById(req.params.id);
    if (!gundam) {
        return res.status(404).json({ error: "Gundam not found" });
    }
    else{
        res.json({
            id: gundam._id,
            name: gundam.name,
            origin: gundam.origin,
            title: gundam.title,
            grade: gundam.grade,
            scale: gundam.scale,
            unitType: gundam.unitType,
            description: gundam.description,
            imageUrl: gundam.imageUrl,
            hasBookmark: gundam.hasBookmark,
            date: gundam.date,
            _links: {
                self: {
                    href: `http://145.24.237.238:${process.env.EXPRESS_PORT}/gunpla/${gundam._id}`
                },
                collection: {
                    href: `http://145.24.237.238:${process.env.EXPRESS_PORT}/gunpla`
                }
            },
        });
    }
});

//Search Gunpla
router.get('/gunpla', async (req, res) => {
    // 1. query parameters uitlezen
    const { q, limit } = req.query;

    // 2. leeg filter object
    let filter = {};

    // 3. ALS zoekterm bestaat
    if (q) {
        filter = {
            $or: [
                { name: { $regex: q } },
                { origin: { $regex: q } },
                { grade: { $regex: q } },
                { unitType: { $regex: q } }
            ]
        };
    }

    // 4. database query met filter
    let query = Gunpla.find(filter);

    // 5. ALS limit bestaat
    if (limit) {
        query = query.limit(Number(limit));
    }

    // 6. uitvoeren + response
    const results = await query;
    res.json(results);
});

router.post('/', async(req, res) => {
    const {name, grade, scale} = req.body;

    if(!name || !grade || !scale){
        return res.status(400).json({ error: 'Empty or invalid resource' });
    }
    try {
        const gundam = await Gundam.create({
            name: req.body.name,
            origin: req.body.origin,
            title: req.body.title,
            grade: req.body.grade,
            scale: req.body.scale,
            unitType: req.body.unitType,
            description: req.body.description,
            imageUrl: req.body.imageUrl,
        });
        res.status(201).json({
            name: gundam.name,
            origin: gundam.origin,
            title: gundam.title,
            grade: gundam.grade,
            scale: gundam.scale,
            unitType: gundam.unitType,
            description: gundam.description,
            imageUrl: gundam.imageUrl,
            _links: {
                self: {
                    href: `http://145.24.237.238:${process.env.EXPRESS_PORT}/gunpla/${gundam._id}`
                },
                collection: {
                    href: `http://145.24.237.238:${process.env.EXPRESS_PORT}/gunpla`
                },
            }
        });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

//Seeder
router.post('/seed', async(req, res) => {
    //Delete
    await Gundam.deleteMany({});

    //Add new ones
    for(let i=0; req.body.amount > i;  i++)
    {
        await Gundam.create({
            name: faker.person.firstName(),
            origin: faker.word.adjective({ strategy: 'shortest' }),
            title: faker.person.firstName(),
            grade: faker.person.firstName(),
            scale: faker.word.adjective({ strategy: 'shortest' }),
            unitType: faker.word.adjective({strategy: 'shortest'}),
            description: faker.lorem.lines(2),
            imageUrl: faker.image.url(),
        });
    }
    res.status(201).send();
});

router.put('/:id/', async(req, res) => {
    const {name, title, origin, grade, scale, unitType, description, imageUrl} = req.body;

    if(!name || !grade || !scale){
        return res.status(400).json({
            error: 'Empty or invalid resource'
        });
    }

    try {
        const gundam = await Gundam.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                origin: req.body.origin,
                title: req.body.title,
                grade: req.body.grade,
                scale: req.body.scale,
                unitType: req.body.unitType,
                description: req.body.description,
                imageUrl: req.body.imageUrl,
            },
            {
                new: true,        // geef geüpdatet document terug
                runValidators: true
            }
        )

        if (!gundam) {
            return res.status(404).send();
        }

        res.status(200).json({
            name: gundam.name,
            origin: gundam.origin,
            title: gundam.title,
            grade: gundam.grade,
            scale: gundam.scale,
            unitType: gundam.unitType,
            description: gundam.description,
            imageUrl: gundam.imageUrl,
            _links: {
                self: {
                    href: `http://145.24.237.238:${process.env.EXPRESS_PORT}/gunpla/${gundam._id}`
                },
                collection: {
                    href: `http://145.24.237.238:${process.env.EXPRESS_PORT}/gunpla`
                },
            },
        });
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

router.delete('/:id', async(req, res) => {
    const gundamDeleted = await Gundam.deleteOne({_id: req.params.id});
    if(gundamDeleted === null){
        res.status(404).send( { message: `Gundam Deleted: ${req.params.id}`});
    }else{ //if more then ones used show status code = 204 - no content
        res.status(204).send({ message: `No content` });
    }
});

router.all('/', (req,res) => {
    res.header('Allow', 'GET','POST', 'OPTIONS');
    res.status(405).json({error: "Wrong Method"});
});

export default router;