// Story Content Extractor - Organizes the narrative content for reading

class StoryExtractor {
    constructor(storyNodes) {
        this.storyNodes = storyNodes;
        this.organizedContent = this.organizeStoryContent();
    }

    // Main function to organize story content
    organizeStoryContent() {
        const content = {
            introduction: this.getIntroductionSection(),
            mainPaths: this.getMainPaths(),
            keyEncounters: this.getKeyEncounters(),
            climax: this.getClimaxSection(),
            endings: this.getEndingsSection(),
            allNodes: this.getAllNodesInOrder()
        };
        
        return content;
    }

    // Get introduction and setup nodes
    getIntroductionSection() {
        const introNodes = ['start', 'intro'];
        return this.extractNodes(introNodes);
    }

    // Get the main exploration paths
    getMainPaths() {
        return {
            villagePath: {
                title: "The Village Path",
                nodes: this.extractNodes(['village_path', 'village_square'])
            },
            forestPath: {
                title: "The Forest Path", 
                nodes: this.extractNodes(['forest_path', 'clearing', 'forest_shrine', 'meeting_yourself'])
            },
            libraryPath: {
                title: "The Library Path",
                nodes: this.extractNodes(['library_entrance', 'library_main_hall', 'library_conversation'])
            },
            gardenPath: {
                title: "The Garden Path",
                nodes: this.extractNodes(['garden_entrance', 'garden_first_fork', 'garden_mirror', 'garden_fountain'])
            }
        };
    }

    // Get key character encounters and decision points
    getKeyEncounters() {
        return {
            drAlbertConversations: {
                title: "Encounters with Dr. Albert",
                nodes: this.extractNodes([
                    'reveal_mission', 'manuscript_examination', 'discuss_time_anomalies',
                    'alternative_solution', 'contemplating_violence', 'gun_drawn',
                    'violence_path', 'mercy_path', 'time_experiment'
                ])
            },
            mysticalExperiences: {
                title: "Mystical and Time-Related Experiences",
                nodes: this.extractNodes([
                    'fountain_meditation', 'future_book', 'refuse_knowledge',
                    'collapse_of_time'
                ])
            }
        };
    }

    // Get the climax section
    getClimaxSection() {
        return this.extractNodes(['tower_base', 'the_point']);
    }

    // Get all possible endings
    getEndingsSection() {
        return {
            originalEnding: this.extractNodes(['original_ending', 'epilogue_original']),
            alternateEnding: this.extractNodes(['alternate_ending', 'epilogue_alternate']),
            refuseEnding: this.extractNodes(['refuse_ending', 'epilogue_refuse'])
        };
    }

    // Extract specific nodes and format them
    extractNodes(nodeIds) {
        return nodeIds.map(nodeId => {
            const node = this.storyNodes[nodeId];
            if (!node) return null;
            
            return {
                id: nodeId,
                title: node.title,
                content: this.cleanContent(node.content),
                type: node.type || 'default',
                timeDistortion: node.timeDistortion || false,
                hasChoices: !!(node.choices && node.choices.length > 0),
                hasExits: !!(node.exits && Object.keys(node.exits).length > 0)
            };
        }).filter(node => node !== null);
    }

    // Clean HTML content for better readability
    cleanContent(content) {
        return content
            .replace(/<p>/g, '')
            .replace(/<\/p>/g, '\n\n')
            .replace(/<em>/g, '*')
            .replace(/<\/em>/g, '*')
            .replace(/<strong>/g, '**')
            .replace(/<\/strong>/g, '**')
            .trim();
    }

    // Get all nodes in a logical reading order
    getAllNodesInOrder() {
        const readingOrder = [
            // Introduction
            'start', 'intro',
            
            // Main exploration paths
            'village_path', 'village_square',
            'forest_path', 'clearing', 'forest_shrine', 'meeting_yourself',
            
            // Library branch
            'library_entrance', 'library_main_hall', 'library_conversation',
            'reveal_mission', 'manuscript_examination', 'discuss_time_anomalies',
            
            // Garden branch
            'garden_entrance', 'garden_first_fork', 'garden_mirror', 'garden_fountain',
            'fountain_meditation',
            
            // Decision points and alternatives
            'alternative_solution', 'contemplating_violence', 'gun_drawn',
            'violence_path', 'mercy_path', 'time_experiment',
            'future_book', 'refuse_knowledge', 'collapse_of_time',
            
            // Climax
            'tower_base', 'the_point',
            
            // Endings
            'original_ending', 'alternate_ending', 'refuse_ending',
            'epilogue_original', 'epilogue_alternate', 'epilogue_refuse'
        ];
        
        return this.extractNodes(readingOrder);
    }

    // Generate a complete story as a single text
    generateCompleteStory() {
        let story = "# The Garden of Forking Paths - Complete Story\n\n";
        
        // Add introduction
        story += "## Introduction\n";
        this.organizedContent.introduction.forEach(node => {
            story += `### ${node.title}\n${node.content}\n\n`;
        });
        
        // Add main paths
        story += "## Main Exploration Paths\n";
        Object.entries(this.organizedContent.mainPaths).forEach(([pathKey, path]) => {
            story += `### ${path.title}\n`;
            path.nodes.forEach(node => {
                story += `#### ${node.title}\n${node.content}\n\n`;
            });
        });
        
        // Add key encounters
        story += "## Key Encounters\n";
        Object.entries(this.organizedContent.keyEncounters).forEach(([encounterKey, encounter]) => {
            story += `### ${encounter.title}\n`;
            encounter.nodes.forEach(node => {
                story += `#### ${node.title}\n${node.content}\n\n`;
            });
        });
        
        // Add climax
        story += "## The Climax\n";
        this.organizedContent.climax.forEach(node => {
            story += `### ${node.title}\n${node.content}\n\n`;
        });
        
        // Add endings
        story += "## Possible Endings\n";
        Object.entries(this.organizedContent.endings).forEach(([endingKey, ending]) => {
            story += `### ${endingKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}\n`;
            ending.forEach(node => {
                story += `#### ${node.title}\n${node.content}\n\n`;
            });
        });
        
        return story;
    }

    // Generate a story summary with key plot points
    generateStorySummary() {
        return {
            title: "The Garden of Forking Paths",
            premise: "A spy named Yu Tsun arrives at a mysterious station where time behaves strangely, and must navigate through a labyrinth of choices to complete his mission.",
            keyThemes: [
                "Multiple realities and parallel timelines",
                "The nature of choice and determinism", 
                "Time as a labyrinth rather than a line",
                "The relationship between violence and duty"
            ],
            mainCharacters: [
                "Yu Tsun - The protagonist, a spy caught between worlds",
                "Dr. Stephen Albert - A scholar who understands the nature of time",
                "Ts'ui Pên - Yu Tsun's ancestor who created the original labyrinth"
            ],
            plotStructure: {
                setup: "Yu Tsun arrives at a station with a mission to signal artillery coordinates",
                exploration: "He explores various paths through village, forest, library, and garden",
                encounter: "He meets Dr. Albert who explains the nature of branching time",
                climax: "All paths converge at a tower called 'The Point'",
                resolution: "Three possible endings based on how he completes his mission"
            },
            possibleEndings: [
                "Original Path: Follows the predetermined violent path",
                "Alternate Path: Uses temporal cipher to avoid violence", 
                "Refuse Path: Breaks the cycle by refusing to complete the mission"
            ]
        };
    }

    // Get content filtered by type or theme
    getContentByType(type) {
        const filteredNodes = Object.entries(this.storyNodes)
            .filter(([nodeId, node]) => node.type === type)
            .map(([nodeId, node]) => ({
                id: nodeId,
                title: node.title,
                content: this.cleanContent(node.content),
                type: node.type
            }));
        
        return filteredNodes;
    }

    // Get nodes with time distortion
    getTimeDistortionNodes() {
        return Object.entries(this.storyNodes)
            .filter(([nodeId, node]) => node.timeDistortion)
            .map(([nodeId, node]) => ({
                id: nodeId,
                title: node.title,
                content: this.cleanContent(node.content),
                type: node.type
            }));
    }
}

// Initialize the extractor (this will be available globally)
let storyExtractor;