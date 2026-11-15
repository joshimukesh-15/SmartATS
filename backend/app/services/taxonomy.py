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


# Equivalent / Complementary Skill Clusters for Stronger Matching
EQUIVALENT_SKILL_FAMILIES: Dict[str, Set[str]] = {
    "React": {"Next.js", "Vue.js", "Angular", "Svelte"},
    "Next.js": {"React"},
    "TypeScript": {"JavaScript"},
    "JavaScript": {"TypeScript"},
    "PostgreSQL": {"MySQL", "SQLite", "SQL", "Oracle Database"},
    "MySQL": {"PostgreSQL", "SQLite", "SQL"},
    "SQL": {"PostgreSQL", "MySQL", "SQLite"},
    "FastAPI": {"Flask", "Django"},
    "Django": {"FastAPI", "Flask"},
    "Flask": {"FastAPI", "Django"},
    "AWS": {"Google Cloud", "Azure"},
    "Google Cloud": {"AWS", "Azure"},
    "Azure": {"AWS", "Google Cloud"},
    "Docker": {"Kubernetes"},
    "Kubernetes": {"Docker"},
    "PyTorch": {"TensorFlow"},
    "TensorFlow": {"PyTorch"},
    "REST API": {"GraphQL", "gRPC"},
    "GraphQL": {"REST API", "gRPC"},
    "MongoDB": {"DynamoDB", "Cassandra", "Firebase", "Redis"},
    "Tailwind CSS": {"CSS", "Bootstrap"},
    "CSS": {"Tailwind CSS", "Bootstrap"},
    "Pandas": {"NumPy", "Apache Spark"},
    "NumPy": {"Pandas"},
}


def get_equivalent_skill_match(required_skill: str, candidate_skills: List[str]) -> Optional[str]:
    """
    Checks if a candidate possesses a functionally equivalent skill to the requirement.
    For instance, if PostgreSQL is required and candidate has MySQL, returns 'MySQL'.
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

