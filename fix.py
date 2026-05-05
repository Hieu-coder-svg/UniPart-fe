import codecs
import re

path = r'c:\Users\Hp\Downloads\Studentjobplatform\src\app\pages\employer\EmployerJobs.tsx'
with codecs.open(path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Fix imports
content = re.sub(
    r'import \{ Plus, Search, Filter, MoreVertical, Eye, Users, Calendar, MapPin \} from "lucide-react";\r?\nimport \{ useState, useEffect \} from "react";\r?\nimport \{ jobService, JobResponse \} from "\.\./\.\./\.\./services/jobService";\r?\nimport \{ applicationService, ApplicationResponse \} from "\.\./\.\./\.\./services/applicationService";',
    'import { Plus, Search, Filter, MoreVertical, Eye, Users, Calendar, MapPin } from "lucide-react";\nimport { useState, useEffect } from "react";\nimport { jobService, JobResponse } from "../../../services/jobService";\nimport { applicationService, ApplicationResponse } from "../../../services/applicationService";\nimport { CreateJobModal } from "../../components/CreateJobModal";',
    content
)

# Add state
content = re.sub(
    r'const \[loading, setLoading\] = useState\(true\);\r?\n',
    'const [loading, setLoading] = useState(true);\n  const [searchTerm, setSearchTerm] = useState("");\n  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);\n',
    content
)

# Fix filter
old_filter = '''  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "all") return true;
    return getJobStatus(job) === activeTab;
  });'''
new_filter = '''  const filteredJobs = jobs.filter((job) => {
    const matchesTab = activeTab === "all" || getJobStatus(job) === activeTab;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = job.title.toLowerCase().includes(searchLower) || 
                          (job.employerName && job.employerName.toLowerCase().includes(searchLower));
    return matchesTab && matchesSearch;
  });'''
content = content.replace(old_filter, new_filter)

# Fix button
old_btn = '''        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <Plus className="w-5 h-5" />
          <span>Đăng tin mới</span>
        </button>'''
new_btn = '''        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <Plus className="w-5 h-5" />
          <span>Đăng tin mới</span>
        </button>'''
content = content.replace(old_btn, new_btn)

# Fix input - more robust regex
content = re.sub(
    r'<input\s+type="text"\s+placeholder="T[^"]*m ki[^"]*m tin tuy[^"]*n d[^"]*ng\.\.\."\s+className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"\s*/>',
    '<input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm kiếm tin tuyển dụng..." className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" />',
    content
)

# Fix Lọc text encoding
content = re.sub(r'<span>L.c</span>', '<span>Lọc</span>', content)

# Add Modal
content = content.replace(
    '      </div>\r\n    </div>\r\n  );\r\n}',
    '      </div>\n      <CreateJobModal \n        isOpen={isCreateModalOpen} \n        onClose={() => setIsCreateModalOpen(false)} \n        onSuccess={() => {\n          jobService.getMyJobPost().then(res => {\n            if (res.result) setJobs(res.result);\n          });\n        }} \n      />\n    </div>\n  );\n}'
)
content = content.replace(
    '      </div>\n    </div>\n  );\n}',
    '      </div>\n      <CreateJobModal \n        isOpen={isCreateModalOpen} \n        onClose={() => setIsCreateModalOpen(false)} \n        onSuccess={() => {\n          jobService.getMyJobPost().then(res => {\n            if (res.result) setJobs(res.result);\n          });\n        }} \n      />\n    </div>\n  );\n}'
)

with codecs.open(path, 'w', encoding='utf-8') as f:
    f.write(content)
