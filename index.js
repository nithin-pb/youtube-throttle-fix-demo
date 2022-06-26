require('dotenv').config()

const AWS = require('aws-sdk')
const awsConfig = {
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}
AWS.config.update(awsConfig)
const client = new AWS.EC2()

const ThrottleFixer = require('aws-throttle-fixer')
const TF = new ThrottleFixer()
const tfConfig = {
    retryCount: 10,
    exceptionCodes: ['RequestLimitExceeded']
}
TF.configure(tfConfig)
const throttleFixFunction = TF.throttleFixer()



async function describeFirst10Snapshots() {
    try {

        let i = 0
        do {
            i = i + 1
            callAwsApi()
                .then(e => console.log(e))
                .catch(e => console.error(e))
        } while (i < 400)

    } catch (e) {
        console.error(e)
    }
}


async function callAwsApi() {
    const params = { MaxResults: 10 }
    //const { Snapshots } = await client.describeSnapshots(params).promise()
    const { Snapshots } = await throttleFixFunction(client, 'describeSnapshots', params)
    return Snapshots.length
}

describeFirst10Snapshots().then()