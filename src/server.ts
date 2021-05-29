import express from 'express';
import { Request, Response } from 'express';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

var validateUrl = require('valid-url');

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(express.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  app.get("/filteredimage", async (req: Request, res: Response) => {
    let { image_url } = req.query as any;

    if (!image_url) {
      return res.status(400).send(`image_url is required`);
    }

    if (!validateUrl.isWebUri(image_url)) {
      return res.status(400).send(`image_url is not a well-formed URL`);
    }

    try {
      let filteredimage = await filterImageFromURL(image_url);

      if (!filteredimage) {
        return res.status(404).send(`image_url not found`);
      }

      await res.status(200).sendFile(filteredimage, {}, (err) => {
        if (err) { return res.status(422).send(`Error while trying process the image`); }


        deleteLocalFiles([filteredimage])
      });
    } catch (err) {
      res.status(500).send(`Error while trying to get, process or send the image`);
    }
  });
  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req: Request, res: Response) => {
    let link = "/filteredimage?image_url=https://picsum.photos/id/237/200/300";
    res.send(`try GET /filteredimage?image_url={{}}  -  <a href='${link}'>${link}</a>`)
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();