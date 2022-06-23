require('dotenv').config()
const AWS = require('aws-sdk')

const awsConfig = {
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}

AWS.config.update(awsConfig)

const ThrottleFixer = require('aws-throttle-fixer')
const TF = new ThrottleFixer()
TF.configure({ retryCount: 1, logger: console.log, exceptionCodes: ['RequestLimitExceeded'] })
const throttleFixFn = TF.throttleFixer()


const client = new AWS.EC2()
const service = 'describeSnapshots'


async function awsCalls() {
    try {
        async function test() {
            const params = { MaxResults: 10 }
            //const { Snapshots } = client.describeSnapshots(params).promise()
            const { Snapshots } = await throttleFixFn(client, service, params)
            console.log('Snapshot count', Snapshots.length)
        }
        let i = 0
        do {
            i = i + 1
            test().then()
        } while (i < 400)
    } catch (e) {
        console.error(e)
    }
}

awsCalls().then()