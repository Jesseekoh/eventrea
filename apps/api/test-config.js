const { ConfigService } = require('@nestjs/config');
process.env.TEST_VAR = 'hello';
const config = new ConfigService();
console.log(config.get('TEST_VAR'));
