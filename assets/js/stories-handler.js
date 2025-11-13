/**
 * Stories Handler - Manages social impact stories functionality
 * Handles story display, filtering, search, and interaction
 */

class StoriesHandler {
  constructor() {
    this.stories = [];
    this.currentPage = 1;
    this.storiesPerPage = 6;
    this.currentFilter = '';
    this.currentSearch = '';
    this.isLoading = false;

    this.init();
  }

  async init() {
    this.initializeEventListeners();
    
    // Load stories from backend
    await this.loadStoriesFromBackend();
    
    // Load stories for the current page - be more specific about page detection
    const currentPath = window.location.pathname;
    const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    
    if (currentPage === 'social-stories.html') {
      this.loadStoriesPage();
    } else if (currentPage === 'story-details.html') {
      this.loadStoryDetailsPage();
    }
  }

  // Load stories from backend API
  async loadStoriesFromBackend() {
    try {
      // First try to load approved contributions (stories)
      const contributionsUrl = `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.CONTRIBUTIONS}?status=Approved&limit=50`;
      const response = await fetch(contributionsUrl);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.contributions && result.data.contributions.length > 0) {
          this.stories = this.transformContributionsToStories(result.data.contributions);
          console.log(`Loaded ${this.stories.length} stories from backend contributions`);
          return;
        }
      }
      
      // If no contributions available, try to load published blogs as fallback
      const blogsUrl = `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.BLOGS}?status=published&limit=20`;
      const blogResponse = await fetch(blogsUrl);
      
      if (blogResponse.ok) {
        const blogResult = await blogResponse.json();
        if (blogResult.success && blogResult.data && blogResult.data.blogs && blogResult.data.blogs.length > 0) {
          // Filter blogs that look like stories (have personal narrative elements)
          const storyBlogs = blogResult.data.blogs.filter(blog => 
            blog.category && ['Community', 'Education', 'Healthcare', 'Justice', 'Youth', 'Environment', 'Women'].includes(blog.category)
          );
          
          if (storyBlogs.length > 0) {
            this.stories = this.transformBlogsToStories(storyBlogs);
            console.log(`Loaded ${this.stories.length} stories from backend blogs`);
            return;
          }
        }
      }
      
      // Check server health
      const healthUrl = `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.HEALTH}`;
      const healthResponse = await fetch(healthUrl);
      
      if (!healthResponse.ok) {
        console.warn('Backend server is not available');
      }
    } catch (error) {
      console.warn('Could not load stories from backend, using sample data:', error);
    }
    
    // Fallback to sample stories if backend is not available
    console.log('Using sample stories as fallback');
    this.loadSampleStories();
  }

  // Transform backend blogs to story format
  transformBlogsToStories(blogs) {
    return blogs.map((blog, index) => ({
      id: blog._id || index + 1,
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt || this.generateExcerpt(blog.content),
      category: blog.category,
      authorName: blog.authorName || blog.author?.name || 'Community Member',
      authorRole: blog.authorBio || 'Community Member',
      authorLocation: blog.authorLocation || 'Patna, Bihar',
      authorAge: '',
      authorImage: blog.author?.avatar || CONFIG.DEFAULTS.AUTHOR_IMAGE,
      image: Utils.getImageUrl(blog.featuredImage) || CONFIG.DEFAULTS.STORY_IMAGE,
      date: Utils.formatDate(blog.publishedAt || blog.createdAt),
      submissionDate: Utils.formatDate(blog.createdAt),
      tags: blog.tags || this.generateTags(blog.category, blog.content),
      location: blog.authorLocation || 'Patna, Bihar',
      impact: '',
      featured: index === 0 // Make first story featured
    }));
  }

  // Transform backend contributions to story format
  transformContributionsToStories(contributions) {
    return contributions.map((contribution, index) => {
      const contributor = contribution.contributor || {};
      const isAnonymous = contribution.isAnonymous || false;
      
      return {
        id: contribution._id || `story_${index + 1}`,
        title: contribution.title,
        content: contribution.description,
        excerpt: this.generateExcerpt(contribution.description),
        category: contribution.category,
        authorName: isAnonymous ? 'Anonymous Community Member' : (contributor.name || 'Community Member'),
        authorRole: isAnonymous ? 'Community Member' : (contributor.role || contributor.category || 'Community Member'),
        authorLocation: contribution.location || 'Patna, Bihar',
        authorAge: isAnonymous ? '' : (contributor.age || ''),
        authorImage: isAnonymous ? CONFIG.DEFAULTS.AUTHOR_IMAGE : (Utils.getImageUrl(contributor.photo_url) || CONFIG.DEFAULTS.AUTHOR_IMAGE),
        image: contribution.media && contribution.media.length > 0 ? contribution.media[0].url : CONFIG.DEFAULTS.STORY_IMAGE,
        date: Utils.formatDate(contribution.date),
        submissionDate: Utils.formatDate(contribution.createdAt || contribution.date),
        tags: this.generateTags(contribution.category, contribution.description),
        location: contribution.location || 'Patna, Bihar',
        impact: contribution.impact || '',
        inspiration: contribution.inspiration || '',
        featured: index === 0, // Make first story featured
        status: contribution.status || 'Approved'
      };
    });
  }

  // Generate excerpt from description
  generateExcerpt(description) {
    const plainText = description.replace(/<[^>]*>/g, '').trim();
    return Utils.truncateText(plainText, 150);
  }

  // Generate tags based on category and content
  generateTags(category, description) {
    const tags = [category.toLowerCase()];
    const commonWords = ['community', 'change', 'impact', 'development', 'empowerment', 'justice', 'education', 'health'];
    const descriptionLower = description.toLowerCase();
    
    commonWords.forEach(word => {
      if (descriptionLower.includes(word) && !tags.includes(word)) {
        tags.push(word);
      }
    });
    
    return tags.slice(0, 4); // Limit to 4 tags
  }

  // Sample stories data (fallback when backend is completely unavailable)
  loadSampleStories() {
    console.warn('Loading sample stories as fallback - backend API is not available');
    this.stories = [
      {
        id: 1,
        title: "From Darkness to Light: How Education Changed My Life",
        content: `
          <p>Growing up in a small village near Patna, I never imagined that education would become my pathway to freedom and empowerment. My story begins in a household where the flickering light of a kerosene lamp was our only companion during the dark evenings.</p>

          <p>As the eldest daughter in a family of six, my responsibilities were clear from an early age: help with household chores, take care of my younger siblings, and prepare for an early marriage. Education was a luxury we couldn't afford, both financially and culturally.</p>

          <p>Everything changed when the "We The People of Patna" movement reached our village. Their education initiative brought not just books and teachers, but hope and possibility. The volunteers didn't just talk about change; they made it happen.</p>

          <p>The movement provided scholarships, convinced parents about the importance of girls' education, and created a supportive environment where learning could flourish. They understood that education isn't just about textbooks—it's about transforming mindsets and breaking generational cycles of poverty.</p>

          <p>Today, I'm pursuing my Bachelor's degree in Social Work, and I dream of becoming a teacher myself. I want to return to my village and light the same spark in other young minds that was lit in mine.</p>

          <p>My journey from a girl who couldn't afford school fees to someone who now mentors other children proves that when a community comes together with the right vision, extraordinary transformations are possible.</p>
        `,
        excerpt: "A young woman's inspiring journey from rural poverty to educational success through community support and determination.",
        category: "Education",
        authorName: "Priya Kumari",
        authorRole: "Student & Community Volunteer",
        authorLocation: "Patna District, Bihar",
        authorAge: "22",
        authorImage: "https://images.unsplash.com/photo-1494790108755-2616c2c51b68?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
        image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: "March 15, 2025",
        submissionDate: "March 10, 2025",
        tags: ["education", "women empowerment", "rural development", "scholarship"],
        location: "Patna District",
        impact: "Priya's story has inspired 15 other girls in her village to continue their education. She now runs weekend literacy classes for women in her community.",
        featured: true
      },
      {
        id: 2,
        title: "Justice Served: How We Fought Corruption Together",
        content: `
          <p>For years, getting basic government services in our neighborhood meant paying bribes and dealing with corrupt officials. Simple tasks like getting a birth certificate or accessing public healthcare became expensive ordeals.</p>

          <p>The breaking point came when my elderly father was denied medical treatment at a government hospital because we refused to pay an illegal fee. That day, I realized that individual complaints wouldn't solve systemic problems—we needed collective action.</p>

          <p>Inspired by the "We The People of Patna" movement's emphasis on citizen empowerment, our neighborhood formed a monitoring committee. We documented every instance of corruption, organized peaceful protests, and demanded accountability from local officials.</p>

          <p>The movement provided us with legal guidance, helped us navigate bureaucratic processes, and most importantly, showed us that ordinary citizens have extraordinary power when they unite for justice.</p>

          <p>Within six months, the corrupt practices at our local government office were eliminated. The officials responsible were transferred, and new transparent procedures were implemented.</p>

          <p>Our success story spread to neighboring areas, and now there are similar citizen monitoring groups throughout the district. We've proven that democracy isn't just about voting—it's about active participation and holding our representatives accountable.</p>
        `,
        excerpt: "A community's successful fight against local corruption through organized citizen action and transparency initiatives.",
        category: "Justice",
        authorName: "Rajesh Singh",
        authorRole: "Local Business Owner",
        authorLocation: "Kankarbagh, Patna",
        authorAge: "45",
        authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
        image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: "March 12, 2025",
        submissionDate: "March 8, 2025",
        tags: ["anti-corruption", "citizen rights", "transparency", "community organizing"],
        location: "Kankarbagh, Patna",
        impact: "The citizen monitoring committee model has been replicated in 12 other neighborhoods, resulting in significant reduction in petty corruption.",
        featured: false
      },
      {
        id: 3,
        title: "Healing Hearts: Building a Better Healthcare System",
        content: `
          <p>As a nurse working in a government hospital, I witnessed daily the struggles of patients who couldn't afford proper treatment. Limited resources, understaffing, and bureaucratic inefficiencies created barriers between healthcare providers and those who needed help most.</p>

          <p>When the "We The People of Patna" movement launched their healthcare accessibility initiative, I knew I had to be part of the solution. The movement's approach was different—they didn't just criticize problems; they worked on practical solutions.</p>

          <p>We started mobile health camps in remote villages, providing free basic medical checkups and health education. The movement helped us secure medical supplies and coordinate with government programs to maximize our reach.</p>

          <p>What made our initiative special was its focus on prevention and education. We taught communities about hygiene, nutrition, and early disease detection. We also trained local volunteers to provide basic first aid and health guidance.</p>

          <p>Over the past year, our mobile health camps have reached over 5,000 people in rural areas. We've successfully treated common ailments, referred serious cases to appropriate facilities, and most importantly, raised health awareness in communities that had limited access to medical information.</p>

          <p>The satisfaction of seeing a mother learn to properly care for her malnourished child, or watching an elderly farmer understand how to manage his diabetes, reminds me why healthcare should be a right, not a privilege.</p>
        `,
        excerpt: "A healthcare worker's mission to bring medical services and health education to underserved rural communities.",
        category: "Healthcare",
        authorName: "Dr. Sunita Devi",
        authorRole: "Government Hospital Nurse",
        authorLocation: "Patna Medical College Hospital",
        authorAge: "38",
        authorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: "March 10, 2025",
        submissionDate: "March 5, 2025",
        tags: ["healthcare", "rural development", "medical camps", "health education"],
        location: "Patna & Rural Districts",
        impact: "The mobile health camp model has been adopted by the district health department and is now running in 25 villages with regular government support.",
        featured: false
      },
      {
        id: 4,
        title: "Green Revolution: Transforming Our Community Environment",
        content: `
          <p>The empty lot behind our housing complex had become a dumping ground for garbage, creating health hazards and environmental problems. Despite numerous complaints to local authorities, nothing changed for years.</p>

          <p>Inspired by the "We The People of Patna" movement's call for citizen-led initiatives, a group of us decided to take matters into our own hands. We organized a community cleanup drive and transformed the wasteland into a beautiful garden.</p>

          <p>The project wasn't easy. We had to convince skeptical neighbors, arrange for proper waste disposal, and coordinate with local authorities for permissions. But the movement's volunteers guided us through the bureaucratic processes and helped us access government schemes for community development.</p>

          <p>Today, our community garden serves as a green lung in our concrete neighborhood. Children play safely, elderly residents enjoy morning walks, and the garden produces vegetables that we distribute to needy families.</p>

          <p>More importantly, our success story has inspired similar initiatives in other parts of the city. We've proven that environmental problems require local solutions, and communities have the power to create positive change.</p>

          <p>The garden has become a symbol of what's possible when citizens take ownership of their environment and work together toward common goals.</p>
        `,
        excerpt: "A community's transformation of a garbage dump into a thriving garden through collective environmental action.",
        category: "Community",
        authorName: "Amit Kumar",
        authorRole: "Software Engineer & Environmental Activist",
        authorLocation: "Boring Road, Patna",
        authorAge: "32",
        authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
        image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: "March 8, 2025",
        submissionDate: "March 3, 2025",
        tags: ["environment", "community garden", "urban development", "waste management"],
        location: "Boring Road, Patna",
        impact: "The project model has been replicated in 8 other neighborhoods, creating over 10,000 square feet of green space in urban Patna.",
        featured: false
      },
      {
        id: 5,
        title: "Voice of the Youth: Empowering the Next Generation",
        content: `
          <p>Growing up in Bihar, I often heard adults say that young people should focus on studies and stay away from politics and social issues. But I believed that if we wanted a better future, we couldn't wait until we were older to start working for it.</p>

          <p>The "We The People of Patna" movement gave young people like me a platform to voice our concerns and contribute to solutions. Through their youth engagement programs, I learned about civic responsibilities, democratic processes, and community organizing.</p>

          <p>Our youth group started by organizing awareness campaigns in colleges about voter registration and civic duties. We created social media content to educate our peers about local issues and encouraged them to participate in community meetings.</p>

          <p>One of our most successful initiatives was the "Youth Budget" project, where we researched and proposed specific budget allocations for youth development in our district. We presented this to local MLAs and municipal authorities.</p>

          <p>The project not only got official recognition but also led to the allocation of funds for youth skill development and employment programs. Seeing our ideas transform into real policy changes was incredibly empowering.</p>

          <p>Today, I mentor younger students and help them understand that democracy isn't something that happens to them—it's something they actively participate in and shape.</p>
        `,
        excerpt: "A young activist's journey from passive observer to active participant in democratic governance and community development.",
        category: "Youth",
        authorName: "Kavya Sharma",
        authorRole: "College Student & Youth Leader",
        authorLocation: "Patna University Campus",
        authorAge: "21",
        authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: "March 5, 2025",
        submissionDate: "February 28, 2025",
        tags: ["youth empowerment", "civic engagement", "student activism", "policy advocacy"],
        location: "Patna University Area",
        impact: "The Youth Budget initiative has been adopted by student councils in 15 colleges across Bihar, influencing youth-focused policy decisions.",
        featured: false
      },
      {
        id: 6,
        title: "Breaking Barriers: Women Leading Change",
        content: `
          <p>In my village, women traditionally had limited voices in community decisions. Even though we made up half the population, our opinions rarely influenced matters that affected our daily lives—from water supply to road maintenance.</p>

          <p>When the "We The People of Patna" movement introduced the concept of women's participation in local governance, many people were skeptical. But a few of us were determined to prove that women could be effective leaders and decision-makers.</p>

          <p>We started by forming women's self-help groups that went beyond microfinance to address community issues. We organized meetings to discuss problems like inadequate street lighting, poor sanitation, and lack of healthcare facilities.</p>

          <p>Our breakthrough came when we successfully lobbied for the installation of hand pumps in areas where women had to walk long distances for water. The project's success gave us credibility and confidence to tackle bigger challenges.</p>

          <p>Today, women in our village actively participate in gram panchayat meetings, and our suggestions are taken seriously. We've proven that inclusive governance leads to better outcomes for everyone.</p>

          <p>My personal journey from a housewife who rarely spoke in public to someone who addresses community meetings and advocates for women's rights shows that change is possible when communities support individual growth.</p>
        `,
        excerpt: "A rural woman's transformation into a community leader and advocate for women's participation in local governance.",
        category: "Community",
        authorName: "Rekha Devi",
        authorRole: "Self-Help Group Leader",
        authorLocation: "Danapur Block, Patna District",
        authorAge: "42",
        authorImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
        image: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        date: "March 1, 2025",
        submissionDate: "February 25, 2025",
        tags: ["women empowerment", "rural governance", "self-help groups", "community leadership"],
        location: "Danapur Block, Patna District",
        impact: "Rekha's leadership has inspired the formation of 12 women's self-help groups in neighboring villages, creating a network of 300+ women actively participating in local governance.",
        featured: false
      }
    ];
  }

  initializeEventListeners() {
    // Search functionality
    const searchInput = document.querySelector('.story-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentSearch = e.target.value.toLowerCase();
        this.currentPage = 1;
        this.filterAndDisplayStories();
      });
    }

    // Category filters
    const categoryFilters = document.querySelectorAll('.story-category-filter');
    categoryFilters.forEach(button => {
      button.addEventListener('click', (e) => {
        this.setActiveFilter(e.target);
        this.currentFilter = e.target.dataset.category.toLowerCase();
        this.currentPage = 1;
        this.filterAndDisplayStories();
      });
    });

    // Load more button
    const loadMoreBtn = document.querySelector('.load-more-stories-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.loadMoreStories();
      });
    }

    // Featured story click handler
    const featuredStory = document.getElementById('featuredStoryContent');
    if (featuredStory) {
      featuredStory.addEventListener('click', (e) => {
        if (!e.target.closest('a')) { // Don't trigger on link clicks
          const featuredStoryData = this.stories.find(story => story.featured);
          if (featuredStoryData) {
            this.navigateToStoryDetails(featuredStoryData.id);
          }
        }
      });
    }
  }

  setActiveFilter(activeButton) {
    const categoryFilters = document.querySelectorAll('.story-category-filter');
    categoryFilters.forEach(btn => {
      btn.classList.remove('bg-primary', 'text-white');
      btn.classList.add('bg-white', 'text-primary', 'border-primary');
    });

    activeButton.classList.add('bg-primary', 'text-white');
    activeButton.classList.remove('bg-white', 'text-primary', 'border-primary');
  }

  loadStoriesPage() {
    // Only load featured story if the elements exist on the page
    if (document.getElementById('featuredStoryPlaceholder') || 
        document.getElementById('featuredStoryContent') || 
        document.getElementById('featuredStoryFallback')) {
      this.loadFeaturedStory();
    }
    
    // Only load stories grid if the container exists
    if (document.querySelector('.stories-grid-container')) {
      this.filterAndDisplayStories();
    }
  }

  loadFeaturedStory() {
    const featuredStory = this.stories.find(story => story.featured);
    
    if (featuredStory) {
      this.displayFeaturedStory(featuredStory);
    } else {
      // Show fallback featured story
      const placeholder = document.getElementById('featuredStoryPlaceholder');
      const fallback = document.getElementById('featuredStoryFallback');
      
      if (placeholder) placeholder.style.display = 'none';
      if (fallback) fallback.classList.remove('hidden');
    }
  }

  displayFeaturedStory(story) {
    // Hide placeholder and show content
    const placeholder = document.getElementById('featuredStoryPlaceholder');
    const content = document.getElementById('featuredStoryContent');
    
    if (placeholder) placeholder.style.display = 'none';
    if (content) content.classList.remove('hidden');

    // Populate featured story content
    const category = document.getElementById('featuredStoryCategory');
    if (category) category.textContent = story.category;
    
    const date = document.getElementById('featuredStoryDate');
    if (date) date.textContent = story.date;
    
    const location = document.getElementById('featuredStoryLocation');
    if (location) location.innerHTML = `<i class="fa-solid fa-map-marker-alt mr-1"></i>${story.location}`;
    
    const title = document.getElementById('featuredStoryTitle');
    if (title) title.textContent = story.title;
    
    const excerpt = document.getElementById('featuredStoryExcerpt');
    if (excerpt) excerpt.textContent = story.excerpt;
    
    // Featured story image
    const image = document.getElementById('featuredStoryImage');
    if (image) {
      image.src = story.image || CONFIG.DEFAULTS.STORY_IMAGE;
      image.alt = story.title;
      image.onerror = function() { this.src = CONFIG.DEFAULTS.STORY_IMAGE; };
    }

    // Author image
    const authorImage = document.getElementById('featuredStoryAuthorImage');
    if (authorImage) {
      authorImage.src = story.authorImage || CONFIG.DEFAULTS.AUTHOR_IMAGE;
      authorImage.alt = story.authorName;
      authorImage.onerror = function() { this.src = CONFIG.DEFAULTS.AUTHOR_IMAGE; };
    }

    // Author info
    const authorName = document.getElementById('featuredStoryAuthorName');
    if (authorName) authorName.textContent = story.authorName;
    
    const authorBio = document.getElementById('featuredStoryAuthorBio');
    if (authorBio) authorBio.textContent = story.authorRole;

    // Set click handler for featured story link
    const link = document.getElementById('featuredStoryLink');
    if (link) link.href = `story-details.html?id=${story.id}`;
  }

  filterAndDisplayStories() {
    let filteredStories = this.stories.filter(story => !story.featured); // Exclude featured story from grid

    // Apply category filter
    if (this.currentFilter && this.currentFilter !== '') {
      filteredStories = filteredStories.filter(story => 
        story.category.toLowerCase().includes(this.currentFilter)
      );
    }

    // Apply search filter
    if (this.currentSearch && this.currentSearch !== '') {
      filteredStories = filteredStories.filter(story => 
        story.title.toLowerCase().includes(this.currentSearch) ||
        story.excerpt.toLowerCase().includes(this.currentSearch) ||
        story.authorName.toLowerCase().includes(this.currentSearch) ||
        story.category.toLowerCase().includes(this.currentSearch)
      );
    }

    this.displayStoriesGrid(filteredStories);
  }

  displayStoriesGrid(stories) {
    const gridContainer = document.querySelector('.stories-grid-container');
    const noStoriesMessage = document.getElementById('noStoriesMessage');
    const loadMoreBtn = document.querySelector('.load-more-stories-btn');

    // Exit early if grid container doesn't exist (not on stories page)
    if (!gridContainer) return;

    if (stories.length === 0) {
      gridContainer.innerHTML = '';
      if (noStoriesMessage) noStoriesMessage.classList.remove('hidden');
      if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
      return;
    }

    if (noStoriesMessage) noStoriesMessage.classList.add('hidden');

    // Calculate stories to display
    const startIndex = 0;
    const endIndex = this.currentPage * this.storiesPerPage;
    const storiesToDisplay = stories.slice(startIndex, endIndex);
    const hasMoreStories = stories.length > endIndex;

    // Generate story cards HTML
    gridContainer.innerHTML = storiesToDisplay.map(story => this.generateStoryCard(story)).join('');

    // Show/hide load more button
    if (loadMoreBtn) {
      if (hasMoreStories) {
        loadMoreBtn.classList.remove('hidden');
      } else {
        loadMoreBtn.classList.add('hidden');
      }
    }

    // Add click handlers to story cards
    this.addStoryCardClickHandlers();
  }

  generateStoryCard(story) {
    return `
      <article class="story-card bg-accent rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-light cursor-pointer transform hover:scale-105" data-story-id="${story.id}">
        <div class="relative h-48 overflow-hidden">
          <img src="${story.image || CONFIG.DEFAULTS.STORY_IMAGE}" alt="${story.title}" class="w-full h-full object-cover" onerror="this.src='${CONFIG.DEFAULTS.STORY_IMAGE}'" />
          <div class="absolute top-4 left-4">
            <span class="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">${story.category}</span>
          </div>
          <div class="absolute inset-0 bg-primary/10 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div class="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <i class="fa-solid fa-arrow-right text-white text-xl"></i>
            </div>
          </div>
        </div>
        
        <div class="p-6">
          
          <h3 class="text-xl font-bold mb-3 text-secondary hover:text-primary transition-colors line-clamp-2">${story.title}</h3>
          
          <p class="text-black leading-relaxed mb-4 line-clamp-3">${story.excerpt}</p>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img src="${story.authorImage || CONFIG.DEFAULTS.AUTHOR_IMAGE}" alt="${story.authorName}" class="w-10 h-10 rounded-full object-cover border-2 border-primary/30" onerror="this.src='${CONFIG.DEFAULTS.AUTHOR_IMAGE}'" />
              <div>
                <div class="text-secondary font-semibold text-sm">${story.authorName}</div>
                <div class="text-primary/70 text-xs">${story.authorRole}</div>
              </div>
            </div>
            <span class="bg-primary/10 text-center text-primary px-4 py-2 rounded-full font-semibold text-sm hover:bg-primary hover:text-white transition-colors">
              Read Story
            </span>
          </div>
        </div>
      </article>
    `;
  }

  addStoryCardClickHandlers() {
    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const storyId = parseInt(card.dataset.storyId);
        this.navigateToStoryDetails(storyId);
      });
    });
  }

  loadMoreStories() {
    this.currentPage++;
    this.filterAndDisplayStories();
  }

  navigateToStoryDetails(storyId) {
    window.location.href = `story-details.html?id=${storyId}`;
  }

  // Story Details Page Methods
  loadStoryDetailsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const storyId = parseInt(urlParams.get('id'));

    if (!storyId) {
      this.showStoryError();
      return;
    }

    const story = this.stories.find(s => s.id === storyId);
    
    if (!story) {
      this.showStoryError();
      return;
    }

    this.displayStoryDetails(story);
    this.loadRelatedStories(story);
  }

  displayStoryDetails(story) {
    // Hide loading, show content
    const loadingElement = document.getElementById('storyLoading');
    const contentElement = document.getElementById('storyContent');
    const errorElement = document.getElementById('storyError');

    if (loadingElement) loadingElement.classList.add('hidden');
    if (errorElement) errorElement.classList.add('hidden');
    if (contentElement) contentElement.classList.remove('hidden');

    // Update page title and breadcrumb
    document.title = `${story.title} - We The People of Patna`;
    const breadcrumbElement = document.getElementById('breadcrumbTitle');
    if (breadcrumbElement) {
      breadcrumbElement.textContent = story.title.length > 30 ? 
        story.title.substring(0, 30) + '...' : story.title;
    }

    // Populate story content
    const categoryBadge = document.getElementById('storyCategoryBadge');
    if (categoryBadge) categoryBadge.textContent = story.category;
    
    const storyDateElement = document.getElementById('storyDate');
    if (storyDateElement) storyDateElement.textContent = story.date;
    
    const storyLocationElement = document.getElementById('storyLocation');
    if (storyLocationElement) storyLocationElement.innerHTML = `<i class="fa-solid fa-map-marker-alt mr-1"></i>${story.location}`;
    
    const storyTitleElement = document.getElementById('storyTitle');
    if (storyTitleElement) storyTitleElement.textContent = story.title;
    
    // Author information
    const authorImage = document.getElementById('authorImage');
    if (authorImage) {
      authorImage.src = story.authorImage || CONFIG.DEFAULTS.AUTHOR_IMAGE;
      authorImage.alt = story.authorName;
      authorImage.onerror = function() { this.src = CONFIG.DEFAULTS.AUTHOR_IMAGE; };
    }
    
    const authorName = document.getElementById('authorName');
    if (authorName) authorName.textContent = story.authorName;
    
    const authorRole = document.getElementById('authorRole');
    if (authorRole) authorRole.textContent = story.authorRole;
    
    const authorLocation = document.getElementById('authorLocation');
    if (authorLocation) authorLocation.textContent = story.authorLocation || '';
    
    const authorAge = document.getElementById('authorAge');
    if (authorAge) authorAge.textContent = story.authorAge ? `Age: ${story.authorAge}` : '';
    
    const submissionDate = document.getElementById('submissionDate');
    if (submissionDate) submissionDate.textContent = new Date(story.submissionDate).toLocaleDateString();

    // Story image
    const storyImageContainer = document.getElementById('storyImageContainer');
    const storyImage = document.getElementById('storyImage');
    if (storyImageContainer && storyImage) {
      storyImageContainer.classList.remove('hidden');
      storyImage.src = story.image || CONFIG.DEFAULTS.STORY_IMAGE;
      storyImage.alt = story.title;
      storyImage.onerror = function() { this.src = CONFIG.DEFAULTS.STORY_IMAGE; };
    }

    // Story content
    const storyBody = document.getElementById('storyBody');
    if (storyBody) storyBody.innerHTML = story.content;

    // Impact section
    const storyImpact = document.getElementById('storyImpact');
    if (story.impact && storyImpact) {
      storyImpact.innerHTML = story.impact;
    } else if (story.inspiration && storyImpact) {
      // Use inspiration as fallback for impact
      storyImpact.innerHTML = story.inspiration;
    }

    // Tags
    const storyTagsSection = document.getElementById('storyTagsSection');
    const storyTags = document.getElementById('storyTags');
    if (story.tags && story.tags.length > 0 && storyTagsSection && storyTags) {
      storyTagsSection.classList.remove('hidden');
      storyTags.innerHTML = '';
      story.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'bg-primary/10 text-primary px-3 py-1 rounded-full text-sm';
        tagElement.textContent = `#${tag}`;
        storyTags.appendChild(tagElement);
      });
    }
  }

  loadRelatedStories(currentStory) {
    // Find stories in the same category or with similar tags
    const relatedStories = this.stories
      .filter(story => story.id !== currentStory.id)
      .filter(story => 
        story.category === currentStory.category ||
        (story.tags && currentStory.tags && 
         story.tags.some(tag => currentStory.tags.includes(tag)))
      )
      .slice(0, 3);

    if (relatedStories.length > 0) {
      document.getElementById('relatedStoriesSection').classList.remove('hidden');
      const relatedGrid = document.getElementById('relatedStoriesGrid');
      relatedGrid.innerHTML = relatedStories.map(story => this.generateStoryCard(story)).join('');
      this.addStoryCardClickHandlers();
    }
  }

  showStoryError() {
    const loadingElement = document.getElementById('storyLoading');
    const contentElement = document.getElementById('storyContent');
    const errorElement = document.getElementById('storyError');

    if (loadingElement) loadingElement.classList.add('hidden');
    if (contentElement) contentElement.classList.add('hidden');
    if (errorElement) errorElement.classList.remove('hidden');
  }

  // Utility method to format date
  formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  // Method to handle story submission (integrated with backend API)
  async submitStory(storyData) {
    try {
      const apiUrl = `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.ADMIN_SUBMIT_ANONYMOUS}`;
      
      // Create FormData for file upload support
      const formData = new FormData();
      
      // Add all story data to FormData
      Object.keys(storyData).forEach(key => {
        if (key === 'media' && Array.isArray(storyData[key])) {
          // Handle file uploads
          storyData[key].forEach(file => {
            formData.append('media', file);
          });
        } else {
          formData.append(key, storyData[key]);
        }
      });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh stories after successful submission
        await this.loadStoriesFromBackend();
        this.filterAndDisplayStories();
        
        return { 
          success: true, 
          message: result.message || 'Story submitted successfully and is pending verification!' 
        };
      } else {
        throw new Error(result.message || 'Failed to submit story');
      }
    } catch (error) {
      console.error('Error submitting story:', error);
      
      // Return user-friendly error messages
      let errorMessage = 'Failed to submit story. Please try again.';
      
      if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your connection and try again.';
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to server. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, message: errorMessage };
    }
  }
}

// Initialize Stories Handler when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.storiesHandler = new StoriesHandler();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StoriesHandler;
}