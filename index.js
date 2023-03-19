// mongod 실행 필수로 돌아가고 있어야 함

const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const mongoose = require("mongoose");
const methodOverride = require('method-override');

// 생성된 MongoDB의 DB객체 하나 불러오기(In product.js)
const Product = require('./models/product');



//mongoose connect
mongoose.connect('mongodb://127.0.0.1:27017/farmStand', {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=> {
    console.log("Connection Open !");
})
.catch(err => {
    console.log("MONGO Connetion Error Occured !!");
    console.log(err);
})

// app set
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
//JSON 사용
app.use(express.json());//req.body의 json 해석
app.use(express.urlencoded({extended:true})); //req.body의 암호화 해석

// method- override 사용
app.use(methodOverride('_method'));


const categories = ['fruit', 'vegetable', 'dairy'];
//route

app.get('/products', async (req,res)=> {
    const {category} = req.query;
    if (category){
        const products = await Product.find({category : category});
        res.render('./products/index.ejs', {products, category});
    }else{
        const products = await Product.find({});
        res.render('./products/index.ejs', {products, category : 'All'});
    }
    
    
    
    
} )

// 프로덕트 새로 만들기 시작
//  ( 밑의 app.get('/products/:id') 보다 앞에 있어야 정상 실행 한다.)
///product/:id 가 앞에 오는 경우, new 라우트를 입력해도 :id에 값이 넘어가는 상황이 발생하기 떄문

app.get('/products/new', (req,res)=>{
    
    res.render('./products/new.ejs', {categories});
})
app.post('/products',async (req, res)=>{
    
    const newProduct = new Product(req.body); //전달 받은 데이터 DB 객체로 생성
    await newProduct.save();
    res.redirect(`/products/${newProduct._id}`)
})

// 프로덕트 새로 만들기 끝


//-----------
app.get('/products/:id', async (req,res)=>{
    const {id} = req.params;
    const productFoundedById = await Product.findById(id);
    
    res.render('./products/show.ejs',{product : productFoundedById});
})

// 프로덕트 업데이트 하기
app.get('/products/:id/edit', async (req,res)=>{
    const { id } = req.params;
    const product = await Product.findById(id)
    res.render('./products/edit.ejs', { product , categories });
})

app.put('/products/:id', async (req, res) =>{
    const { id } = req.params;
    const productUpdated= await Product.findByIdAndUpdate(id, req.body,{runValidators:true});
    res.redirect(`/products/${productUpdated._id}`);
})

//프로덕트 삭제하기
app.delete('/products/:id', async (req,res)=>{
    const { id } = req.params;
    console.log(id);
    console.log("Delete One");
    const productDelete = await Product.findByIdAndDelete(id);
    res.redirect('/products');
})







app.listen(port , () => {
    console.log(`localhost:${port} being Attached`);
})