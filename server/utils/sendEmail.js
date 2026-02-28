// Dummy email sender for now

const sendEmail = async (options) => {
    // console.log(`[EMAIL SEND] To: ${options.email}, Subject: ${options.subject}, Message: ${options.message}`);
    console.log('\n--- MOCK EMAIL ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    console.log('------------------\n');
    return true;
};

module.exports = sendEmail;
