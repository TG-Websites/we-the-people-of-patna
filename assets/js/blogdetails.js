// Blog Details JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Sample blog data - in a real application, this would come from a database or API
    const blogData = {
        1: {
            title: "Breaking the Challan Exploitation: A Citizen's Victory",
            author: "Vishal Singh",
            date: "January 15, 2025",
            readTime: "5 min read",
            image: "assets/images/generated-image (1).png",
            content: `
                <p>Our first major breakthrough in reforming Patna's traffic challan system shows how organized citizen action can challenge unfair practices and demand accountability from authorities.</p>
                
                <h3 class="text-2xl font-bold text-primary mt-8 mb-4">The Problem We Faced</h3>
                <p>For years, the people of Patna have endured an exploitative challan system that prioritized revenue generation over genuine traffic safety. Citizens were being fined for minor infractions while major traffic violations went unnoticed. The system lacked transparency, and there was no proper mechanism for citizens to appeal unfair challans.</p>
                
                <h3 class="text-2xl font-bold text-primary mt-8 mb-4">Our Approach</h3>
                <p>We organized a systematic campaign involving:</p>
                <ul class="list-disc list-inside my-4 space-y-2">
                    <li>Documentation of unfair challan practices</li>
                    <li>Citizen testimonials and evidence collection</li>
                    <li>Peaceful dialogue with traffic authorities</li>
                    <li>Media engagement to raise awareness</li>
                    <li>Legal consultation on citizens' rights</li>
                </ul>
                
                <h3 class="text-2xl font-bold text-primary mt-8 mb-4">The Victory</h3>
                <p>After months of persistent effort, we achieved significant reforms in the challan system. The authorities agreed to implement more transparent procedures, establish a proper appeal mechanism, and focus on education rather than just punishment.</p>
                
                <p>This victory demonstrates that when citizens unite with a clear purpose and peaceful approach, even entrenched systems can be reformed. It's not just about traffic challans – it's about establishing the principle that governance should serve the people, not exploit them.</p>
                
                <h3 class="text-2xl font-bold text-primary mt-8 mb-4">What's Next</h3>
                <p>This success has energized our movement and shown us the path forward. We're now working on expanding these principles to other areas of governance, always maintaining our commitment to peaceful, constructive change.</p>
            `,
            tags: ["Reform", "Traffic", "Citizens Rights", "Governance"],
            authorImage: "assets/images/neta g.jpg",
            authorBio: "Visionary leader and reformist thinker behind 'We The People of Patna' movement."
        },
        2: {
            title: "Youth for Bihar: The New Generation of Change-Makers",
            author: "Vishal Singh",
            date: "January 10, 2025",
            readTime: "4 min read",
            image: "assets/images/generated-image (2).png",
            content: `
                <p>How young professionals and students are becoming the backbone of our civic reform movement, bringing fresh perspectives and digital-age solutions to age-old problems.</p>
                
                <h3 class="text-2xl font-bold text-primary mt-8 mb-4">The Power of Youth</h3>
                <p>Bihar's youth represent our greatest asset for transformation. With their energy, education, and digital nativity, they are uniquely positioned to drive the changes our state desperately needs.</p>
                
                <h3 class="text-2xl font-bold text-primary mt-8 mb-4">Youth Initiatives</h3>
                <p>Our young volunteers are leading several key initiatives:</p>
                <ul class="list-disc list-inside my-4 space-y-2">
                    <li>Digital awareness campaigns on social media</li>
                    <li>Data collection and analysis for civic audits</li>
                    <li>Community outreach programs</li>
                    <li>Technology solutions for governance transparency</li>
                    <li>Educational workshops on civic rights and responsibilities</li>
                </ul>
                
                <h3 class="text-2xl font-bold text-primary mt-8 mb-4">Success Stories</h3>
                <p>Young activists in our movement have successfully organized neighborhood clean-up drives, created awareness about voting rights, and even developed mobile apps to report civic issues. Their enthusiasm is contagious and inspiring.</p>
                
                <p>The future of Bihar lies in empowering our youth to take ownership of their communities and their future. When young people are engaged in the democratic process, real change becomes possible.</p>
            `,
            tags: ["Youth", "Education", "Technology", "Community"],
            authorImage: "assets/images/neta g.jpg",
            authorBio: "Visionary leader and reformist thinker behind 'We The People of Patna' movement."
        },
        3: {
            title: "Building Self-Governance: Ward-Level Democracy in Action",
            author: "Vishal Singh",
            date: "January 5, 2025",
            readTime: "6 min read",
            image: "assets/images/generated-image (7).png",
            content: `
                <p>Our pilot program for decentralized decision-making is showing promising results. Learn how taxpayers and citizens are directly participating in local governance.</p>
                
                <h3 class="text-2xl font-bold text-primary mt-8 mb-4">The Vision of Self-Governance</h3>
                <p>True democracy begins at the grassroots level. Our self-governance model empowers citizens to take direct control of decisions that affect their daily lives, from local infrastructure to community services.</p>
                
                <h3 class="text-2xl font-bold text-primary mt-8 mb-4">How It Works</h3>
                <p>Our ward-level democracy model includes:</p>
                <ul class="list-disc list-inside my-4 space-y-2">
                    <li>Monthly ward meetings with all residents</li>
                    <li>Transparent budget discussions and voting</li>
                    <li>Citizen committees for specific issues</li>
                    <li>Direct feedback mechanisms to local authorities</li>
                    <li>Community-driven project prioritization</li>
                </ul>
                
                <h3 class="text-2xl font-bold text-primary mt-8 mb-4">Early Results</h3>
                <p>In our pilot wards, we've seen remarkable improvements in civic engagement. Citizens are more informed about local issues, infrastructure problems are being addressed more quickly, and there's a renewed sense of community ownership.</p>
                
                <p>This model proves that when people are given real power to shape their communities, they rise to the occasion. Self-governance isn't just an ideal – it's a practical solution that works.</p>
                
                <h3 class="text-2xl font-bold text-primary mt-8 mb-4">Scaling Up</h3>
                <p>Based on our success, we're planning to expand this model to more wards across Patna. The goal is to create a network of empowered communities that can serve as a model for the entire state of Bihar.</p>
            `,
            tags: ["Self-Governance", "Democracy", "Community", "Local Government"],
            authorImage: "assets/images/neta g.jpg",
            authorBio: "Visionary leader and reformist thinker behind 'We The People of Patna' movement."
        }
    };

    // Related blogs data
    const relatedBlogs = [
        {
            id: 1,
            title: "Breaking the Challan Exploitation: A Citizen's Victory",
            excerpt: "Our first major breakthrough in reforming Patna's traffic challan system...",
            image: "assets/images/generated-image (1).png",
            date: "January 15, 2025",
            category: "Reform"
        },
        {
            id: 2,
            title: "Youth for Bihar: The New Generation of Change-Makers",
            excerpt: "How young professionals and students are becoming the backbone...",
            image: "assets/images/generated-image (2).png",
            date: "January 10, 2025",
            category: "Youth"
        },
        {
            id: 3,
            title: "Building Self-Governance: Ward-Level Democracy in Action",
            excerpt: "Our pilot program for decentralized decision-making is showing...",
            image: "assets/images/generated-image (7).png",
            date: "January 5, 2025",
            category: "Governance"
        }
    ];

    // Get blog ID from URL parameters
    function getBlogId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || '1'; // Default to blog 1 if no ID specified
    }

    // Load blog content
    function loadBlogContent() {
        const blogId = getBlogId();
        const blog = blogData[blogId];

        if (!blog) {
            // If blog not found, show error or redirect
            document.getElementById('blogTitle').textContent = 'Blog Not Found';
            return;
        }

        // Hide loading spinner
        setTimeout(() => {
            document.getElementById('loadingSpinner').style.display = 'none';
        }, 1000);

        // Populate header content
        setTimeout(() => {
            document.getElementById('blogTitle').textContent = blog.title;
            document.getElementById('blogDate').textContent = blog.date;
            document.getElementById('blogAuthor').textContent = blog.author;
            document.getElementById('readTime').textContent = blog.readTime;

            // Show header content and hide placeholder
            document.getElementById('headerPlaceholder').classList.add('hidden');
            document.getElementById('headerContent').classList.remove('hidden');
        }, 1200);

        // Populate featured image
        setTimeout(() => {
            const featuredImage = document.getElementById('featuredImage');
            featuredImage.src = blog.image;
            featuredImage.alt = blog.title;
            
            document.getElementById('imagePlaceholder').classList.add('hidden');
            featuredImage.classList.remove('hidden');
        }, 1400);

        // Populate blog content
        setTimeout(() => {
            const contentElement = document.getElementById('actualContent');
            contentElement.innerHTML = blog.content;
            
            // Add proper styling for rich text content
            contentElement.classList.add('prose', 'prose-lg', 'prose-primary', 'max-w-none');
            
            document.getElementById('contentPlaceholder').classList.add('hidden');
            contentElement.classList.remove('hidden');
        }, 1600);

        // Populate author info
        setTimeout(() => {
            document.getElementById('authorImage').src = blog.authorImage;
            document.getElementById('authorName').textContent = blog.author;
            document.getElementById('authorBio').textContent = blog.authorBio;
            
            document.getElementById('authorPlaceholder').classList.add('hidden');
            document.getElementById('authorContent').classList.remove('hidden');
        }, 1800);

        // Populate tags
        setTimeout(() => {
            const tagsList = document.getElementById('tagsList');
            tagsList.innerHTML = '';
            
            blog.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-secondary transition-colors cursor-pointer';
                tagElement.textContent = tag;
                tagsList.appendChild(tagElement);
            });
            
            document.getElementById('tagsPlaceholder').classList.add('hidden');
            document.getElementById('tagsContent').classList.remove('hidden');
        }, 2000);
    }

    // Load related blogs
    function loadRelatedBlogs() {
        const currentBlogId = getBlogId();
        const container = document.getElementById('relatedBlogsContainer');
        
        setTimeout(() => {
            container.innerHTML = '';
            
            // Filter out current blog and show up to 3 related blogs
            const filteredBlogs = relatedBlogs.filter(blog => blog.id.toString() !== currentBlogId).slice(0, 3);
            
            filteredBlogs.forEach(blog => {
                const blogCard = document.createElement('article');
                blogCard.className = 'bg-white border border-light rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer';
                blogCard.onclick = () => {
                    window.location.href = `blog-details.html?id=${blog.id}`;
                };
                
                blogCard.innerHTML = `
                    <div class="relative overflow-hidden">
                        <img src="${blog.image}" alt="${blog.title}" 
                             class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
                        <div class="absolute top-4 left-4">
                            <span class="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">${blog.category}</span>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="flex items-center gap-3 mb-3 text-sm text-primary/70">
                            <i class="fa-solid fa-calendar-days"></i>
                            <span>${blog.date}</span>
                        </div>
                        <h3 class="text-xl font-semibold text-secondary mb-3 group-hover:text-primary transition-colors">
                            ${blog.title}
                        </h3>
                        <p class="text-primary leading-relaxed mb-4">
                            ${blog.excerpt}
                        </p>
                        <div class="inline-flex items-center gap-2 text-primary font-semibold hover:text-secondary transition-colors">
                            Read More <i class="fa-solid fa-arrow-right text-sm"></i>
                        </div>
                    </div>
                `;
                
                container.appendChild(blogCard);
            });
        }, 2200);
    }

    // Initialize the page
    loadBlogContent();
    loadRelatedBlogs();

    // Update page title
    const blogId = getBlogId();
    const blog = blogData[blogId];
    if (blog) {
        document.title = `${blog.title} - We The People of Patna`;
    }
});
