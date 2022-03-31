import { AzureFunction, Context } from "@azure/functions"
import { BpaEngine } from "../engine"
import { serviceCatalog } from "../engine/serviceCatalog"
import { BpaConfiguration } from "../engine/types"
import { CosmosDB } from "../services/cosmosdb"


const blobTrigger: AzureFunction = async function (context: Context, myBlob: Buffer): Promise<void> {
    try {
        context.log(`Name of source doc : ${context.bindingData.blobTrigger}`)
        const db = new CosmosDB(process.env.COSMOSDB_CONNECTION_STRING, process.env.COSMOSDB_DB_NAME, process.env.COSMOSDB_CONTAINER_NAME)
        const config = await db.getConfig()
        context.log(JSON.stringify(config.stages))
        const bpaConfig: BpaConfiguration = {
            stages: []
        }
        
        for (const stage of config.stages) {
            for(const sc of Object.keys(serviceCatalog)){
                if(stage.name === serviceCatalog[sc].name){
                    context.log(`found ${stage.name}`)
                    bpaConfig.stages.push({ service : serviceCatalog[sc] })
                }
            }
        }

        const engine = new BpaEngine()
        await engine.processFile(myBlob, context.bindingData.blobTrigger, bpaConfig)
    }
    catch (err) {
        context.log(err)
    }
};

export default blobTrigger;