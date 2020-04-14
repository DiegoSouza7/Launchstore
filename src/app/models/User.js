const db = require('../../config/db')
const { hash } = require('bcryptjs')
const fs = require('fs')
const Product = require('../models/Product')

module.exports = {
    async findOne(filters) {
        let query = "SELECT * FROM users"
        console.log(filters)
        
        Object.keys(filters).map(key => {
            query = `${query} ${key}`
            console.log(query)
            
            Object.keys(filters[key]).map(field => {
                query = `${query} ${field} = '${filters[key][field]}'`
                console.log(query)
            })
        })
        
        const results = await db.query(query)

        return results.rows[0]

    },
    async create(data) {
        try {
            const query = `
            INSERT INTO users (
                name,
                email,
                password,
                cpf_cnpj,
                cep,
                address
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `
        
        const passwordHash = await hash(data.password, 8)

        const values = [
            data.name,
            data.email,
            passwordHash,
            data.cpf_cnpj.replace(/\D/g,""),
            data.cep.replace(/\D/g,""),
            data.address
        ]

        const results = await db.query(query, values)
        
        return results.rows[0].id
        }catch(error) {
            console.error(error)
        }
    },
    async update(id, fields) {
        let query = "UPDATE users SET"

        console.log("ESTUDANDO UPDATE")
        //console.log(fields)

        //  Object.keys(fields): transformar as chaves de um objeto, para array
        // console.log(Object.keys(fields))
        
        // Após a linha acima, eu rodo um map em cima do array criado
        // Object.keys(fields).map(() => {})


        // Object.keys(fields).map((key, index, array) => {

        //     // O que são os 3 parametros do map() ?
        //     // (key, index, array)
        //     // console.log("key:", key) // elemento do array
        //     // console.log("index:", index) // Posição no array
        //     // console.log("array:", array) // Object.keys(fields) 



        //     // if((index + 1) < array.length) {

        //         // console.log("key: ", key)
        //         // console.log("fields[key]", fields[key])
        //         // console.log(`${key} = '${fields[key]}`)
                
        //         query = `${query} ${key} = '${fields[key]}',`

        //     // Supondo que eu não queira o else, o que fazer?
        //     // } else {
        //     //     // last iteration
        //     //     query = `${query}
        //     //         ${key} = '${fields[key]}'
        //     //         WHERE id = ${id}
        //     //     `
        //     // }
        //     // console.log("QUERY: ", query) 

        // })

        // // Supondo que eu não queira o else, o que fazer?
        // query = `${query.slice(0, -1)} WHERE id = ${id}`

        Object.keys(fields).map(key => query = `${query} ${key} = '${fields[key]}',`)
        query = `${query.slice(0, -1)} WHERE id = ${id}`


        // console.log(query)

        await db.query(query)
        return
    },
    async delete(id) {
        //pegar todos os produtos
        let results = await db.query("SELECT * FROM products WHERE user_id = $1", [id])
        const products = results.rows

        // dos produtos, pegar todas as imagens
        const allFilesPromise = products.map(product => 
            Product.files(product.id))

        let promiseResults = await Promise.all(allFilesPromise)

        // rodar a remoção do usuário
        await db.query('DELETE FROM users WHERE id = $1', [id])

        // remover as imagens da pasta public
        promiseResults.map(results => {
            results.rows.map(file => {
                try {
                    fs.unlinkSync(file.path)
                } catch(err) {
                    console.error(err)
                }

            })
        })
    }
}