import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

// const inputPath = 'profile/profile.md';
// const outputPath = 'profile.html';

// const md = fs.readFileSync(inputPath, 'utf8');
// const html = marked(md);

// fs.writeFileSync(outputPath, html, 'utf8');
// console.log(`Converted ${inputPath} → ${outputPath}`);
/**
 * @param {string} inputDir - 입력 디렉토리 경로
 * @param {string} outputDir - 출력 디렉토리 경로
 */
export function convert(inputDir, outputDir) {
  try {
    // outputDir이 존재하지 않는 경우, 폴더 생성
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`출력 디렉토리 생성: ${outputDir}`);
    }

    const files = fs.readdirSync(inputDir);
    // const mdFiles = files.filter(file => path.extname(file) === '.md');

    // if(mdFiles.length === 0) {
    //   console.log("변환할 md 파일이 없습니다.");
    //   return;
    // }

    const renderer = new marked.Renderer();

    renderer.link = function (href, title, text) {
      // href가 객체인 경우 문자열로 변환
      let linkHref = '';
      if (typeof href === 'string') {
        linkHref = href;
      } else if (href && typeof href === 'object' && href.href) {
        linkHref = href.href;
      }

      if (linkHref.endsWith('.md')) {
        linkHref = linkHref.replace(/\.md$/, '.html');
      }

      log("링크: "  + linkHref);
      return `<a href="${linkHref}"${title ? ` title="${title}"` : ''}>${text}</a>`;
    }

renderer.link = function (href, title, text) {
      // href가 객체인 경우 문자열로 변환
      let linkHref = '';
      if (typeof href === 'string') {
        linkHref = href;
      } else if (href && typeof href === 'object' && href.href) {
        linkHref = href.href;
      }

      if (linkHref.endsWith('.md')) {
        linkHref = linkHref.replace(/\.md$/, '.html');
      }

      return `<a href="${linkHref}"${title ? ` title="${title}"` : ''}>${text}</a>`;
    }

    files.forEach(file => {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);
      const stat = fs.statSync(inputPath);

      if (stat.isDirectory()) {
        // inputPath(inputDir) 안에 하위 폴더가 있으면 재귀호출
        convert(inputPath, outputPath);
      } else if (path.extname(file) === '.md') {
        const md = fs.readFileSync(inputPath, 'utf8');
        const html = marked(md, { renderer });
        const finalOutputPath = outputPath.replace(/\.md$/, '.html');
        fs.writeFileSync(finalOutputPath, html, 'utf8');
        console.log(`변환 완료: ${inputPath} → ${finalOutputPath}`);
      }
    });
  } catch (err) {
    console.error("변환 오류 발생: ", err.message);
  }

}
