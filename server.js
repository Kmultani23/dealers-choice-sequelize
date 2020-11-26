const Sequelize = require('sequelize');
const { STRING } = Sequelize
const client = new Sequelize("postgres://localhost/teacher_db");
const express = require('express')
app = express();

app.get('/', async(req,res, next)=> {
    try{
        res.send(`
        <html>
            <head>
            <h1> What class? <h1>
                <body>
                <ul>
                        <li>
                        <a href= '/subject'>  All Subject  </a>
                        </li>
                        <li>
                        <a href= '/professor'>  All Professor  </a>
                        </li>
                        
                </ul>
                </body
            </head
        </html>
        `)
    }
    catch(ex){
        next(ex)
    }

})
app.get('/subject', async(req,res, next)=>{
    try{
        res.send(await Subject.findAll({
            include: [
                
                    Professor
                
            ]
        }))
    }
    catch(ex){
        next(ex)
    }
})
app.get('/professor', async(req,res, next)=>{
    try{
        res.send(await Professor.findAll({
            include : [ 
                {
                model: Professor,
                as: 'principal'
            }, 
                Professor
            ]
        }))
    }
    catch(ex){
        next(ex)
    }
})
const Professor = client.define('professor',{
    name:{
        type: STRING,
    }


})

const Subject = client.define('subjects', {
    name:{
        type: STRING
    }
})

Professor.belongsTo(Subject)
Subject.hasMany(Professor)
Professor.belongsTo(Professor, {as: 'principal'})
Professor.hasMany(Professor, {foreignKey: 'principalId'})

const syncAndSeed = async() =>{
    await client.sync({force: true })
    const [gor, bindi, ajay]= await Promise.all([
        'Gor', 'Bindi', 'Ajay'
    ].map(name => 
        Professor.create({name})
    ))
    const [history, gym, physics] = await Promise.all([
        'History' , 'Gym', 'Physics'

    ].map(name =>
        Subject.create({name})
    ));
    
    gor.subjectId = history.id;
    bindi.subjectId = physics.id;
    ajay.subjectId = gym.id
    bindi.principalId = ajay.id; 
    gor.principalId = ajay.id;

     await Promise.all(
         [
             gor.save(),
             bindi.save(),
             ajay.save(),
         ]
     )
        
        
        
    console.log('hello')
}

const init = async() =>{
    try{
        await client.authenticate()
        await syncAndSeed();
        const port = process.env.PORT || 1337;
        app.listen(port, () => console.log(`im being heard on ${port}`))
    }
    catch(ex){
        console.log(ex)

    }
}

init() 