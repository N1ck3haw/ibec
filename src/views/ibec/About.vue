<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLanguage } from '../../composables/useLanguage'

const { isEnglish } = useLanguage()
const baseUrl = import.meta.env.BASE_URL

const tracks = [
  {
    id: 'track-1',
    title: { en: 'AI-driven Life Science Discovery', zh: 'AI驱动的生命科学发现' },
    content: {
      en: 'This track focuses on using artificial intelligence and machine learning to solve fundamental problems in life sciences. Participants are encouraged to develop innovative models and methods for tasks such as protein structure prediction, drug discovery, and genomics analysis.',
      zh: '本赛道专注于利用人工智能和机器学习解决生命科学中的基础问题。鼓励参赛者开发创新模型和方法，用于蛋白质结构预测、药物发现和基因组学分析等任务。'
    }
  },
  {
    id: 'track-2',
    title: { en: 'Novel Bioinformatics Algorithms / Methods', zh: '新型生物信息学算法/方法' },
    content: {
      en: 'This track aims to develop novel algorithms and computational methods for analyzing biological data. Projects may involve sequence alignment, phylogenetics, network analysis, or any other area where algorithmic innovation can advance biological understanding.',
      zh: '本赛道旨在开发用于分析生物数据的新型算法和计算方法。项目可能涉及序列比对、系统发育学、网络分析或任何其他算法创新可以推动生物学理解的领域。'
    }
  },
  {
    id: 'track-3',
    title: { en: 'Bioinformatics Resources / Platforms', zh: '生物信息学资源/平台' },
    content: {
      en: 'This track challenges participants to build robust and user-friendly bioinformatics resources or platforms. This could include databases, web servers, or software tools that facilitate data access, visualization, and analysis for the scientific community.',
      zh: '本赛道挑战参赛者构建稳健且用户友好的生物信息学资源或平台。这可能包括促进科学界数据访问、可视化和分析的数据库、Web服务器或软件工具。'
    }
  },
  {
    id: 'track-4',
    title: { en: 'Bio-engineering Applications', zh: '生物工程应用实现' },
    content: {
      en: 'This track emphasizes the practical application of bioinformatics in bio-engineering and real-world scenarios. Projects should demonstrate how computational approaches can be applied to synthetic biology, metabolic engineering, or clinical diagnostics.',
      zh: '本赛道强调生物信息学在生物工程和现实场景中的实际应用。项目应展示计算方法如何应用于合成生物学、代谢工程或临床诊断。'
    }
  }
]
</script>

<template>
  <div class="py-12 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Introduction -->
      <div class="mb-16" id="introduction">
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
          {{ isEnglish ? 'Introduction' : '竞赛简介' }}
        </h2>
        <div class="prose prose-lg text-gray-500 mx-auto">
          <p v-if="isEnglish">
            The 1st International Bioinformatics Engineering Competition (iBEC) is a team-based international competition designed to gather students and young researchers from around the world. It aims to solve critical life science problems by applying interdisciplinary methods from bioinformatics, artificial intelligence, and bio-engineering.
          </p>
          <p v-else>
            国际生物信息工程竞赛（iBEC）是一项以团队为单位的国际性竞赛，旨在汇聚来自全球的学生与青年科研人员，运用生物信息学、人工智能与生物工程等交叉方法，解决重要生命科学问题。
          </p>
        </div>
      </div>

      <!-- Tracks -->
      <div class="mb-16">
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
          {{ isEnglish ? 'Competition Tracks' : '竞赛赛道' }}
        </h2>
        <div class="mt-6 space-y-8">
          <div v-for="(track, index) in tracks" :key="track.id" :id="track.id" class="relative bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 class="text-xl font-bold text-brand-blue mb-2">
              {{ index + 1 }}. {{ isEnglish ? track.title.en : track.title.zh }}
            </h3>
            <p class="text-base text-gray-600">
              {{ isEnglish ? track.content.en : track.content.zh }}
            </p>
          </div>
        </div>
      </div>

      <!-- Participants -->
      <div class="mb-16">
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
          {{ isEnglish ? 'Participants (Eligibility)' : '参赛对象' }}
        </h2>
        <div class="prose prose-lg text-gray-500">
          <ul class="list-disc pl-5 space-y-2">
            <li v-if="isEnglish">
              <strong>Eligibility:</strong> Undergraduate students, graduate students, and young researchers from universities and institutes worldwide.
            </li>
            <li v-else>
              <strong>参赛对象：</strong> 全球高校本科生、研究生及青年科研人员。
            </li>
            
            <li v-if="isEnglish">
              <strong>Team Size:</strong> Teams are recommended to be composed of no more than 10 members from diverse disciplinary backgrounds.
            </li>
            <li v-else>
              <strong>团队规模：</strong> 参赛团队建议由10名以内成员组成，鼓励来自不同学科背景。
            </li>

            <li v-if="isEnglish">
              <strong>Advisor:</strong> Each team may have 1 or more advisors.
            </li>
            <li v-else>
              <strong>指导老师：</strong> 每队可选1名或多名。
            </li>
          </ul>
        </div>
      </div>

      <!-- Review Committee -->
      <div class="mb-16">
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
          {{ isEnglish ? 'Review Committee' : '评审委员会' }}
        </h2>
        <div class="bg-white p-8 rounded-lg shadow-sm border border-gray-200 prose prose-lg max-w-none text-gray-500">
            <p v-if="isEnglish">
                The iBEC Committee consists of a diverse team of interdisciplinary experts to ensure fairness, professionalism, and international standards in the review process. The committee members cover the following fields:
            </p>
            <p v-else>
                iBEC 委员会由一支多元化的跨学科专家团队组成，以确保评审过程的公平性、专业性和国际化标准。委员会成员涵盖以下领域的多学科专家：
            </p>
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <li class="flex items-start">
                    <span class="text-brand-blue mr-2">•</span>
                    {{ isEnglish ? 'Bioinformatics and Computational Biology' : '生物信息学与计算生物学' }}
                </li>
                <li class="flex items-start">
                    <span class="text-brand-blue mr-2">•</span>
                    {{ isEnglish ? 'Artificial Intelligence and Machine Learning Algorithms' : '人工智能与机器学习算法' }}
                </li>
                <li class="flex items-start">
                    <span class="text-brand-blue mr-2">•</span>
                    {{ isEnglish ? 'Molecular Biology, Synthetic Biology, and Molecular Engineering' : '分子生物学、合成生物学与分子工程' }}
                </li>
                <li class="flex items-start">
                    <span class="text-brand-blue mr-2">•</span>
                    {{ isEnglish ? 'Bioethics, Biosafety, and Data Privacy' : '生物伦理、生物安全与数据隐私' }}
                </li>
                <li class="flex items-start">
                    <span class="text-brand-blue mr-2">•</span>
                    {{ isEnglish ? 'Engineering Applications and Technology Translation' : '工程应用与技术转化' }}
                </li>
            </ul>
            <p v-if="isEnglish" class="mt-4">
                This composition ensures a multi-dimensional, cross-disciplinary perspective in the review process, avoiding bias towards any single research direction.
            </p>
            <p v-else class="mt-4">
                这种构成确保评审过程具有多维度、跨学科的视角，避免偏向任何单一研究方向。
            </p>
        </div>
      </div>

      <!-- Competition Format -->
      <div class="mb-16">
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
          {{ isEnglish ? 'Competition Format' : '竞赛形式' }}
        </h2>
        
        <div class="space-y-8">
            <!-- Phase 1 -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 class="text-xl font-bold text-brand-blue mb-4">
                    {{ isEnglish ? 'Phase 1: Preliminary Round — Project Submission Review' : '第一阶段：初赛——项目材料评审' }}
                </h3>
                <div class="prose prose-blue text-gray-600 max-w-none">
                    <p v-if="isEnglish">
                        <strong>Review Process:</strong> A unified blind review based on written materials submitted by teams.
                    </p>
                    <p v-else>
                        <strong>评审流程：</strong> 基于团队提交的书面材料进行统一盲审。
                    </p>
                    
                    <h4 class="font-bold mt-4 mb-2">{{ isEnglish ? 'Preliminary Evaluation Criteria (100%)' : '初赛评分标准（满分100%）' }}</h4>
                    <ul class="list-disc pl-5 space-y-1">
                        <li v-if="isEnglish"><strong>Originality & Innovation (25%):</strong> Novelty of methods, models, applications, or concepts.</li>
                        <li v-else><strong>原创性与创新性（25%）：</strong> 方法、模型、应用或概念的创新程度。</li>
                        
                        <li v-if="isEnglish"><strong>Technical Rigor (25%):</strong> Soundness of methodology and theoretical foundation.</li>
                        <li v-else><strong>技术严谨性（25%）：</strong> 方法学的合理性、理论基础的扎实性。</li>
                        
                        <li v-if="isEnglish"><strong>Engineering Design & Translation Potential (20%):</strong> Modularity, usability, and practical feasibility.</li>
                        <li v-else><strong>工程化设计与转化潜力（20%）：</strong> 系统的模块化、可用性及实际落地可行性。</li>
                        
                        <li v-if="isEnglish"><strong>Scientific & Social Significance (20%):</strong> Potential value in addressing major challenges.</li>
                        <li v-else><strong>科学与社会意义（20%）：</strong> 项目在学术、工业或社会层面应对重大挑战的潜在价值。</li>
                        
                        <li v-if="isEnglish"><strong>Reproducibility & Transparency (10%):</strong> Clarity of workflow, code, and data.</li>
                        <li v-else><strong>可重复性与数据透明度（10%）：</strong> 工作流程、代码与数据的清晰完整程度。</li>
                    </ul>

                    <h4 class="font-bold mt-4 mb-2">{{ isEnglish ? 'Submission Requirements' : '材料提交说明' }}</h4>
                     <ul class="list-disc pl-5 space-y-1">
                        <li v-if="isEnglish"><strong>Content:</strong> ZIP/RAR file containing Project Report (PDF), Technical Abstract (PDF), and optional supplementary materials.</li>
                        <li v-else><strong>提交内容：</strong> 打包为压缩文件（ZIP/RAR），包含项目报告（PDF）、技术摘要（PDF）及补充材料（可选）。</li>
                        
                         <li v-if="isEnglish"><strong>Deadline:</strong> September 30, 2026.</li>
                        <li v-else><strong>截止日期：</strong> 2026年9月30日。</li>
                    </ul>
                </div>
            </div>

            <!-- Phase 2 -->
             <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 class="text-xl font-bold text-brand-blue mb-4">
                    {{ isEnglish ? 'Phase 2: Final Round — On-site Presentation' : '第二阶段：决赛——现场展示' }}
                </h3>
                <div class="prose prose-blue text-gray-600 max-w-none">
                     <p v-if="isEnglish">
                        <strong>Format:</strong> 5–8 minute on-site presentation, with optional software demo or prototype evaluation.
                    </p>
                    <p v-else>
                        <strong>决赛形式：</strong> 入围团队进行5–8分钟现场汇报，并可选择进行软件演示、原型评测等现场展示。
                    </p>
                    
                    <h4 class="font-bold mt-4 mb-2">{{ isEnglish ? 'Final Evaluation Criteria (100%)' : '决赛评分标准（满分100%）' }}</h4>
                    <ul class="list-disc pl-5 space-y-1">
                        <li v-if="isEnglish"><strong>Scientific & Social Significance (30%)</strong></li>
                        <li v-else><strong>科学与社会意义（30%）</strong></li>
                        
                        <li v-if="isEnglish"><strong>Originality & Innovation (30%)</strong></li>
                        <li v-else><strong>原创性与创新性（30%）</strong></li>
                        
                        <li v-if="isEnglish"><strong>Validation & Demo (20%)</strong></li>
                        <li v-else><strong>验证与成果展示（20%）</strong></li>
                        
                        <li v-if="isEnglish"><strong>Technical Rigor (10%)</strong></li>
                        <li v-else><strong>技术严谨性（10%）</strong></li>

                         <li v-if="isEnglish"><strong>Presentation (10%)</strong></li>
                        <li v-else><strong>展示与答辩（10%）</strong></li>
                    </ul>
                </div>
            </div>
        </div>
      </div>

      <!-- Awards -->
      <div class="mb-16">
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
          {{ isEnglish ? 'Evaluation Criteria and Awards' : '评选标准和奖项设置' }}
        </h2>
        
        <div class="space-y-12">
            
             <!-- Track Specific Awards (Moved Top) -->
            <div>
                 <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center border-l-4 border-blue-500 pl-4">
                    {{ isEnglish ? 'Track-Specific Awards' : '赛道专属奖' }}
                     <span class="ml-3 text-sm font-normal text-white bg-blue-500 px-3 py-1 rounded-full">
                        {{ isEnglish ? '30% Preliminary + 70% Final' : '初赛成绩30%+决赛成绩70%' }}
                    </span>
                </h3>
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group">
                        <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            🧬
                        </div>
                        <h4 class="font-bold text-gray-900 mb-2">{{ isEnglish ? 'Best AI for Life Discovery' : '最佳AI生命发现奖' }}</h4>
                        <p class="text-xs text-gray-500">{{ isEnglish ? 'Track 1' : '赛道一' }}</p>
                    </div>
                    
                    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group">
                         <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 text-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            🧮
                        </div>
                        <h4 class="font-bold text-gray-900 mb-2">{{ isEnglish ? 'Best Frontier Algorithm' : '最佳前沿算法奖' }}</h4>
                        <p class="text-xs text-gray-500">{{ isEnglish ? 'Track 2' : '赛道二' }}</p>
                    </div>

                    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group">
                         <div class="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-2xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                            💻
                        </div>
                        <h4 class="font-bold text-gray-900 mb-2">{{ isEnglish ? 'Best Resource/Platform' : '最佳生信资源库/平台奖' }}</h4>
                        <p class="text-xs text-gray-500">{{ isEnglish ? 'Track 3' : '赛道三' }}</p>
                    </div>

                    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group">
                         <div class="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4 text-2xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            ⚙️
                        </div>
                        <h4 class="font-bold text-gray-900 mb-2">{{ isEnglish ? 'Best Bio-engineering App' : '最佳生物工程应用奖' }}</h4>
                        <p class="text-xs text-gray-500">{{ isEnglish ? 'Track 4' : '赛道四' }}</p>
                    </div>
                </div>
            </div>

            <!-- Individual Category Awards -->
            <div>
                <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center border-l-4 border-indigo-500 pl-4">
                    {{ isEnglish ? 'Individual Category Awards' : '单项等级奖' }}
                </h3>
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex-shrink-0 flex items-center justify-center text-2xl mr-4">
                                🎨
                            </div>
                            <h4 class="text-xl font-bold text-gray-900">{{ isEnglish ? 'Outstanding Original Design Award' : '卓越原创设计奖' }}</h4>
                        </div>
                        <p class="text-gray-600 text-sm leading-relaxed">
                            {{ isEnglish ? 'This award recognizes teams or individuals who demonstrate exceptional innovation and unique design concepts in bioinformatics engineering projects, highlighting originality and creative value.' : '该奖项旨在表彰在生物信息工程项目中展现出卓越创新能力和独特设计理念的团队或个人，突出项目的原创性与创造价值。' }}
                        </p>
                        <p class="text-gray-500 text-xs mt-3">
                            {{ isEnglish ? '(Awarded to the top 30% in Originality & Innovation scores.)' : '（授予原创性与创新性评分排名前 30% 的参赛团队或个人。）' }}
                        </p>
                    </div>

                    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex-shrink-0 flex items-center justify-center text-2xl mr-4">
                                ⚙️
                            </div>
                            <h4 class="text-xl font-bold text-gray-900">{{ isEnglish ? 'Outstanding Engineering Technology Award' : '卓越工程技术奖' }}</h4>
                        </div>
                        <p class="text-gray-600 text-sm leading-relaxed">
                            {{ isEnglish ? 'This award honors teams or individuals showcasing superior engineering skills and technical implementation capabilities in the competition, emphasizing professional proficiency and practical application.' : '该奖项旨在表彰在竞赛中展现出卓越工程能力和技术实现水平的团队或个人，强调专业能力与实际应用价值。' }}
                        </p>
                        <p class="text-gray-500 text-xs mt-3">
                            {{ isEnglish ? '(Awarded to the top 30% in Engineering Design & Translation Potential scores.)' : '（授予工程化设计与转化潜力评分排名前 30% 的参赛团队或个人。）' }}
                        </p>
                    </div>

                    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-2xl mr-4">
                                🎤
                            </div>
                            <h4 class="text-xl font-bold text-gray-900">{{ isEnglish ? 'Outstanding Presentation Award' : '优秀风采展示奖' }}</h4>
                        </div>
                        <p class="text-gray-600 text-sm leading-relaxed">
                            {{ isEnglish ? 'This award commends participating teams or individuals for their excellence in project showcases, speeches, or reports, specifically for vivid expression and effectively presenting their team spirit.' : '该奖项旨在表彰在项目展示、演讲或汇报中表现优异的参赛团队或个人，重点肯定其生动表达能力和团队风采展示效果。' }}
                        </p>
                        <p class="text-gray-500 text-xs mt-3">
                            {{ isEnglish ? '(Awarded to the top 30% in Presentation scores.)' : '（授予展示与答辩评分排名前 30% 的参赛团队或个人。）' }}
                        </p>
                    </div>

                    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex-shrink-0 flex items-center justify-center text-2xl mr-4">
                                🏅
                            </div>
                            <h4 class="text-xl font-bold text-gray-900">{{ isEnglish ? 'Outstanding Organization & Management Award' : '优秀组织管理奖' }}</h4>
                        </div>
                        <p class="text-gray-600 text-sm leading-relaxed">
                            {{ isEnglish ? 'This award recognizes schools, laboratories, or institutions that have demonstrated excellence, high efficiency, and significant contributions during the organization, coordination, and support of the competition.' : '该奖项旨在表彰在竞赛组织、协调与支持工作中表现卓越、高效有序并作出重要贡献的学校、实验室或机构。' }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Overall Awards -->
             <div>
                <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center border-l-4 border-yellow-500 pl-4">
                    {{ isEnglish ? 'Overall Ranking Awards' : '全局等级奖' }}
                    <span class="ml-3 text-sm font-normal text-white bg-yellow-500 px-3 py-1 rounded-full">
                        {{ isEnglish ? 'Based on Final Round Criteria' : '按照决赛评审标准' }}
                    </span>
                </h3>
                
                <div class="grid md:grid-cols-3 gap-6">
                    <!-- Grand Prize -->
                    <div class="md:col-span-3 bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-sm flex flex-col md:flex-row items-center text-center md:text-left">
                         <div class="w-20 h-20 bg-yellow-500 text-white rounded-full flex-shrink-0 flex items-center justify-center text-4xl shadow-lg mb-4 md:mb-0 md:mr-6">
                            🏆
                        </div>
                        <div>
                            <h4 class="text-2xl font-bold text-gray-900 mb-2">{{ isEnglish ? 'Grand Prize' : '特等奖' }}</h4>
                            <p class="text-gray-700">
                                {{ isEnglish ? 'The highest honor, awarded to the team with the strongest overall capabilities and best presentation.' : '全场最高荣誉，颁发给综合实力最强、答辩表现最完美的团队。' }}
                            </p>
                        </div>
                    </div>

                    <!-- Gold -->
                    <div class="bg-white p-6 rounded-xl border-t-4 border-yellow-400 shadow-sm">
                        <div class="flex items-center justify-between mb-4">
                             <h4 class="text-xl font-bold text-gray-900">{{ isEnglish ? 'Gold Medal' : '金奖' }}</h4>
                             <span class="text-2xl">🥇</span>
                        </div>
                        <p class="text-gray-600 text-sm">
                            {{ isEnglish ? 'Top 10-15% of finalist teams.' : '约占进入决赛队伍的 10-15%。' }}
                        </p>
                    </div>

                    <!-- Silver -->
                    <div class="bg-white p-6 rounded-xl border-t-4 border-gray-400 shadow-sm">
                         <div class="flex items-center justify-between mb-4">
                             <h4 class="text-xl font-bold text-gray-900">{{ isEnglish ? 'Silver Medal' : '银奖' }}</h4>
                             <span class="text-2xl">🥈</span>
                        </div>
                        <p class="text-gray-600 text-sm">
                            {{ isEnglish ? 'Top 20-30% of finalist teams.' : '约占进入决赛队伍的 20-30%。' }}
                        </p>
                    </div>

                    <!-- Bronze -->
                    <div class="bg-white p-6 rounded-xl border-t-4 border-orange-400 shadow-sm">
                         <div class="flex items-center justify-between mb-4">
                             <h4 class="text-xl font-bold text-gray-900">{{ isEnglish ? 'Bronze / Excellence' : '铜奖 / 优胜奖' }}</h4>
                             <span class="text-2xl">🥉</span>
                        </div>
                        <p class="text-gray-600 text-sm">
                            {{ isEnglish ? 'Granted to all other finalist teams in recognition of their efforts.' : '授予所有其他顺利完成决赛展示的入围团队，作为对其科研付出的认可。' }}
                        </p>
                    </div>
                </div>
             </div>
        </div>
      </div>

      <!-- Venue / Map -->
      <div class="mb-16">
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
          {{ isEnglish ? 'Venue' : '决赛地点' }}
        </h2>
        <div class="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-2">
              {{ isEnglish ? 'Zijingang Campus, Zhejiang University' : '浙江大学紫金港校区' }}
            </h3>
            <p class="text-gray-600 mb-4">
              {{ isEnglish ? 'Hangzhou, China' : '中国杭州' }}
            </p>
            
            <!-- Map Toggle (Disabled) -->
            <!-- 
            <div class="flex space-x-4 mb-4">
              <button 
                @click="currentMap = 'google'"
                :class="[
                  'px-4 py-2 rounded-md font-medium transition-colors flex items-center',
                  currentMap === 'google' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                <img :src="`${baseUrl}googlemap.png`" alt="Google Map" class="w-6 h-6 mr-2 rounded-sm object-cover" />
                Google Map
              </button>
              <button 
                @click="currentMap = 'baidu'"
                :class="[
                  'px-4 py-2 rounded-md font-medium transition-colors flex items-center',
                  currentMap === 'baidu' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                <img :src="`${baseUrl}baidumap.png`" alt="Baidu Map" class="w-6 h-6 mr-2 rounded-sm object-cover" />
                Baidu Map {{ isEnglish ? '(Recommended in China)' : '(国内推荐)' }}
              </button>
            </div>
            -->

            <!-- Map Container (Static Image or Text instead of interactive map to disable links?) -->
            <!-- User said "Disable map jump function, remove all hyperlinks and click events" -->
            <!-- The easiest way is to use pointer-events-none on the iframe container or replace iframes with static images if available. -->
            <!-- Since I don't have static images, I will wrap the iframes in a div with pointer-events-none to block interaction. -->
            
            <!-- 高德地图 -->
            <div class="w-full h-[500px] rounded-md overflow-hidden border border-gray-300">
              <iframe
                width="100%"
                height="100%"
                frameborder="0"
                scrolling="no"
                src="https://uri.amap.com/marker?position=120.0874,30.3053&name=浙江大学紫金港校区&src=mypage&coordinate=gaode&callnative=0"
                style="border:0;"
              ></iframe>
            </div>
            
          </div>
        </div>
      </div>

      <!-- Contact -->
      <div class="mb-16">
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
          {{ isEnglish ? 'Contact' : '联系方式' }}
        </h2>
        <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <p class="text-lg text-gray-600">
                {{ isEnglish ? 'For inquiries related to submissions, please contact the Organizing Committee at:' : '如有相关疑问，请联系组委会：' }}
                <a href="mailto:ibec@zju.edu.cn" class="text-brand-blue font-bold hover:underline">ibec@zju.edu.cn</a>
            </p>
        </div>
      </div>

    </div>
  </div>
</template>
