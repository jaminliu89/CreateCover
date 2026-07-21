const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/shared\/types['"]/g, 'from \'../../shared/types\'');
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/shared\/types['"]/g, 'from \'../shared/types\'');
  content = content.replace(/from ['"]\.\.\/\.\.\/shared\/types['"]/g, 'from \'../shared/types\'');
  fs.writeFileSync(filePath, content);
  console.log('Fixed:', filePath);
}

const files = [
  'src/components/Canvas.tsx',
  'src/components/TemplatesPanel.tsx',
  'src/components/elements/TextElement.tsx',
  'src/components/elements/ImageElement.tsx',
  'src/components/elements/ShapeElement.tsx',
  'src/components/properties/TypeSettings.tsx',
  'src/components/properties/ImageSettings.tsx',
  'src/store/useEditorStore.ts',
];

files.forEach(f => fixFile(path.join(process.cwd(), f)));
console.log('Done!');
