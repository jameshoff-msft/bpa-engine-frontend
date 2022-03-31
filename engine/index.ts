import { BpaConfiguration, BpaStage, BpaServiceObject } from "./types"

export class BpaEngine {

    constructor() {

    }

    public processFile = async (fileBuffer: Buffer, fileName: string, config: BpaConfiguration) => {
        try {
            let currentInput: BpaServiceObject = {
                label: "first",
                type: this._getFileType(fileName),
                projectName: "project",
                data: fileBuffer,
                bpaId: "1"
            }

            console.log(this._getFileType(fileName))

            for (const stage of config.stages) {
                console.log(`stage : ${stage.service.name}`)
                console.log('validating...')
                if (this._validateInput(currentInput.type, stage)) {
                    if(stage.serviceSpecificConfig){
                        currentInput.extraConfig = stage.serviceSpecificConfig
                    }
                    console.log('validation passed!!')
                    console.log('processing....')
                    const currentOutput: BpaServiceObject = await stage.service.process(currentInput)
                    console.log('exiting stage')
                    currentInput = currentOutput
                }
                else {
                    throw new Error(`invalid input type ${currentInput} for stage ${stage.service.name}`)
                }
            }
        } catch (err) {
            console.log(err)
        }
    }

    private _validateInput = (input: string, stage: BpaStage): boolean => {
        if(stage.service.name == 'view'){
            return true
        }
        if (stage.service.inputTypes.includes(input)) {
            return true
        }
        return false
    }

    private _getFileType = (fileName: string): string => {
        const fileParts: string[] = fileName.split('.')
        return fileParts[fileParts.length - 1]
    }

}