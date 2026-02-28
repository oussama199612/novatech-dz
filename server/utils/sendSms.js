// Dummy SMS sender for now

const sendSms = async (options) => {
    // console.log(`[SMS SEND] Phone: ${options.phone}, Message: ${options.message}`);
    console.log('\n--- MOCK SMS ---');
    console.log(`Phone: ${options.phone}`);
    console.log(`Message:\n${options.message}`);
    console.log('----------------\n');
    return true;
};

module.exports = sendSms;
