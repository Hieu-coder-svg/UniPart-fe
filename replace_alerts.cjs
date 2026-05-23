const fs = require('fs');
let code = fs.readFileSync('src/app/pages/student/JobDetail.tsx', 'utf8');
if (!code.includes('import Swal')) {
  code = code.replace(/import \{ useParams /, 'import Swal from "sweetalert2";\nimport { useParams ');
}
code = code.replace(/alert\((.*?)\);/g, (match, p1) => `Swal.fire('Thông báo', ${p1}, 'info');`);
fs.writeFileSync('src/app/pages/student/JobDetail.tsx', code);
