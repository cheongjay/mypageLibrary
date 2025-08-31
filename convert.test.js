import { test } from "vitest";
import {execSync} from "child_process";
import { log } from "console";
import {convert} from "./convert2"
test('src 경로가 파라미터로 주어졌을 때 폴더 구조를 파싱해서 md 파일들을 읽는다.',()=>{
    // console.log("hello");
    
    const inputPath = 'profile';
    const outputPath = 'result';
    // const npmCommand = execSync(`npm start ${inputPath} ${outputPath}`, {stdio: "pipe"} )
    //                 .toString()
    //                 .trim();
    // log(npmCommand);
    log(inputPath+outputPath);
    log(convert(inputPath, outputPath));


}

)

test.skip('dest 경로가 파라미터로 주어졌을 때 html 파일이 해당 경로에 만들어진다.',()=>{

}

)


test.skip('start.js 에서 convert를 호출하면 convert.js가 실행된다. ',()=>{

}
)
