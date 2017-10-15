import swaggerCombine from 'swagger-combine';

export default class SwaggerCombiner
{
  constructor(title, version) {
    this.title = title;
    this.version = version;
  }

  combine (filePaths) {
    return swaggerCombine({
      swagger: '2.0',
      info: {
        title: this.title,
        version: this.version,
      },
      apis: filePaths.map((file, index) => {
        return {
          url: file,
          securityDefinitions: {
            rename: {
              bearer: `bearer${index}`,
              Bearer: `Bearer${index}`,
            }
          }
        }
      })
    }, {
      dereference: {
        circular: 'ignore',
      }
    })
  }
}