"""
Comprehensive Skills Taxonomy for Technical Screening.
Maps canonical skill names to recognized aliases, acronyms, and variations.
"""
from typing import Dict, List, Set, Optional
import re

SKILLS_TAXONOMY: Dict[str, List[str]] = {
    # Programming Languages
    "Python": ["python", "python3", "py"],
    "JavaScript": ["javascript", "js", "ecmascript"],
    "TypeScript": ["typescript", "ts"],
    "Java": ["java", "jdk", "jvm", "j2ee"],
    "C++": ["c++", "cpp"],
    "C#": ["c#", "csharp", ".net c#"],
    "C": ["c programming", "c-lang", r"\bc\b"],
    "Go": ["golang", r"\bgo\b"],
    "Rust": ["rust", "rustlang"],
    "PHP": ["php", "php7", "php8"],
    "Ruby": ["ruby", "ruby on rails", "ror"],
    "Swift": ["swift"],
    "Kotlin": ["kotlin"],
    "Scala": ["scala"],
    "R": ["r programming", "r-lang", r"\br\b"],
    "SQL": ["sql", "structured query language"],
    "HTML": ["html", "html5"],
    "CSS": ["css", "css3", "sass", "scss", "less"],
    "Bash": ["bash", "shell scripting", "powershell", "zsh"],

    # Frontend Frameworks & Libraries
    "React": ["react", "react.js", "reactjs"],
    "Next.js": ["next.js", "nextjs", "next"],
    "Vue.js": ["vue", "vue.js", "vuejs"],
    "Nuxt.js": ["nuxt", "nuxt.js", "nuxtjs"],
    "Angular": ["angular", "angular.js", "angularjs", "angular 2+"],
    "Svelte": ["svelte", "sveltekit"],
    "Redux": ["redux", "redux toolkit", "rtk"],
    "Tailwind CSS": ["tailwind", "tailwindcss", "tailwind-css"],
    "Bootstrap": ["bootstrap", "bootstrap 5"],
    "Material UI": ["material ui", "mui", "material-ui"],
    "Webpack": ["webpack", "vite", "esbuild", "turbopack"],

    # Backend Frameworks
    "FastAPI": ["fastapi", "fast-api"],
    "Django": ["django", "django rest framework", "drf"],
    "Flask": ["flask"],
    "Node.js": ["node.js", "nodejs", "node"],
    "Express.js": ["express", "express.js", "expressjs"],
    "NestJS": ["nestjs", "nest.js"],
    "Spring Boot": ["spring", "spring boot", "springboot", "spring mvc"],
    "ASP.NET": ["asp.net", "asp.net core", ".net core", "dotnet"],
    "Laravel": ["laravel"],
    "Ruby on Rails": ["ruby on rails", "rails"],
    "GraphQL": ["graphql", "apollo client", "apollo server"],
    "REST API": ["rest", "restful", "rest api", "rest apis", "restful api", "restful apis"],
    "gRPC": ["grpc", "protocol buffers", "protobuf"],

    # Databases & Caching
    "PostgreSQL": ["postgresql", "postgres", "psql"],
    "MySQL": ["mysql"],
    "MongoDB": ["mongodb", "mongo"],
    "Redis": ["redis"],
    "SQLite": ["sqlite", "sqlite3"],
    "Elasticsearch": ["elasticsearch", "elastic search", "opensearch"],
    "DynamoDB": ["dynamodb", "aws dynamodb"],
    "Cassandra": ["cassandra", "apache cassandra"],
    "Oracle Database": ["oracle db", "oracle database", "pl/sql"],
    "Firebase": ["firebase", "firestore"],
    "Supabase": ["supabase"],

    # Cloud & DevOps
    "AWS": ["aws", "amazon web services", "ec2", "s3", "lambda", "ecs", "eks", "rds"],
    "Google Cloud": ["gcp", "google cloud", "google cloud platform", "bigquery"],
    "Azure": ["azure", "microsoft azure"],
    "Docker": ["docker", "dockerfile", "docker-compose"],
    "Kubernetes": ["kubernetes", "k8s"],
    "Terraform": ["terraform", "iac"],
    "CI/CD": ["ci/cd", "ci cd", "continuous integration", "github actions", "gitlab ci", "jenkins"],
    "Linux": ["linux", "ubuntu", "debian", "centos", "redhat", "unix"],
    "Nginx": ["nginx"],
    "Ansible": ["ansible"],
    "Prometheus": ["prometheus", "grafana"],

    # AI, Machine Learning & Data Science
    "Machine Learning": ["machine learning", "ml"],
    "Deep Learning": ["deep learning", "dl"],
    "Natural Language Processing": ["nlp", "natural language processing", "text mining"],
    "Computer Vision": ["computer vision", "cv", "opencv"],
    "Large Language Models": ["llm", "large language models", "prompt engineering", "langchain", "llamaindex", "rag"],
    "PyTorch": ["pytorch", "torch"],
    "TensorFlow": ["tensorflow", "tf", "keras"],
    "Scikit-Learn": ["scikit-learn", "sklearn"],
    "Pandas": ["pandas"],
    "NumPy": ["numpy"],
    "Apache Spark": ["spark", "pyspark", "apache spark"],
    "Airflow": ["airflow", "apache airflow"],
    "Kafka": ["kafka", "apache kafka"],

    # Testing & Tooling
    "Git": ["git", "github", "gitlab", "bitbucket"],
    "Unit Testing": ["pytest", "unittest", "jest", "mocha", "junit", "unit test", "unit testing"],
    "Agile": ["agile", "scrum", "kanban", "jira"],
    "Microservices": ["microservices", "microservice", "service-oriented architecture", "soa"],
    "System Design": ["system design", "distributed systems", "high availability"]
}


def normalize_skill_name(raw_name: str) -> str:
    """Finds canonical name for a given skill string or returns stripped title case."""
    raw_lower = raw_name.strip().lower()
    for canonical, aliases in SKILLS_TAXONOMY.items():
        if raw_lower == canonical.lower():
            return canonical
        for alias in aliases:
            # Check exact alias match or regex word match
            if alias.startswith(r"\b") and re.fullmatch(alias, raw_lower):
                return canonical
            elif raw_lower == alias.lower():
                return canonical
    return raw_name.strip().title()


# Genuine Equivalent Skill Families (Strict Technical Equivalents)
# Excludes unrelated or distinct technologies (e.g. React != Vue, Docker != Kubernetes)
EQUIVALENT_SKILL_FAMILIES: Dict[str, Set[str]] = {
    # React ecosystem: Next.js is built directly on React
    "React": {"Next.js"},
    "Next.js": {"React"},

    # JavaScript / TypeScript superset
    "TypeScript": {"JavaScript"},
    "JavaScript": {"TypeScript"},

    # Relational ANSI SQL Databases
    "PostgreSQL": {"MySQL", "SQLite", "SQL", "Oracle Database"},
    "MySQL": {"PostgreSQL", "SQLite", "SQL"},
    "SQL": {"PostgreSQL", "MySQL", "SQLite"},

    # Python REST Frameworks (lightweight ASGI/WSGI microframeworks)
    "FastAPI": {"Flask"},
    "Flask": {"FastAPI"},

    # Hyperscale Cloud Infrastructure (75% transferable architectural competence)
    "AWS": {"Google Cloud", "Azure"},
    "Google Cloud": {"AWS", "Azure"},
    "Azure": {"AWS", "Google Cloud"},

    # Deep Learning Frameworks
    "PyTorch": {"TensorFlow"},
    "TensorFlow": {"PyTorch"},

    # Scientific Python
    "Pandas": {"NumPy"},
    "NumPy": {"Pandas"},
}

EQUIVALENCE_EXPLANATIONS: Dict[str, str] = {
    "React": "Next.js incorporates React components, architecture, and hooks.",
    "Next.js": "React provides the foundational runtime for Next.js applications.",
    "TypeScript": "TypeScript is a typed superset of JavaScript with direct syntax compatibility.",
    "JavaScript": "JavaScript foundational knowledge transfers directly to TypeScript development.",
    "PostgreSQL": "Relational SQL database sharing standard ANSI SQL query semantics and ACID principles.",
    "MySQL": "Relational SQL database sharing standard ANSI SQL query semantics and ACID principles.",
    "FastAPI": "Lightweight Python microframework for RESTful API services.",
    "Flask": "Lightweight Python microframework for RESTful API services.",
    "AWS": "Hyperscale cloud platform with transferable IaaS/PaaS architecture.",
    "Google Cloud": "Hyperscale cloud platform with transferable IaaS/PaaS architecture.",
    "Azure": "Hyperscale cloud platform with transferable IaaS/PaaS architecture.",
    "PyTorch": "High-level tensor computation and deep learning neural network framework.",
    "TensorFlow": "High-level tensor computation and deep learning neural network framework.",
    "Pandas": "Core Python data analysis and array computation ecosystem.",
    "NumPy": "Core Python numerical computation and array manipulation ecosystem.",
}


def get_equivalent_skill_match(required_skill: str, candidate_skills: List[str]) -> Optional[str]:
    """
    Checks if a candidate possesses a functionally equivalent skill to the requirement.
    For instance, if PostgreSQL is required and candidate has MySQL, returns 'MySQL'.
    Guarantees no false equivalence between distinct technologies (e.g. React vs Vue, Docker vs Kubernetes).
    """
    canonical_req = normalize_skill_name(required_skill)
    equivalents = EQUIVALENT_SKILL_FAMILIES.get(canonical_req, set())
    if not equivalents:
        return None

    cand_canonical_set = {normalize_skill_name(s) for s in candidate_skills}
    for eq in equivalents:
        if eq in cand_canonical_set:
            return eq
    return None


def get_equivalent_skill_explanation(required_skill: str, equivalent_skill: str) -> str:
    """Returns an explainable recruiter-facing justification for equivalent skill credit."""
    canonical_req = normalize_skill_name(required_skill)
    explanation = EQUIVALENCE_EXPLANATIONS.get(canonical_req)
    if explanation:
        return f"{equivalent_skill} awarded 75% equivalent credit for {required_skill}: {explanation}"
    return f"{equivalent_skill} recognized as transferable equivalent for {required_skill}."

