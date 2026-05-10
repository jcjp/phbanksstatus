# Spex Quick Reference

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     SPEX WORKFLOW                                │
└─────────────────────────────────────────────────────────────────┘

  Ideation          Planning          Implementation       Quality
     │                 │                    │                 │
     ▼                 ▼                    ▼                 ▼
┌─────────┐     ┌──────────┐        ┌──────────┐      ┌──────────┐
│brainstorm│────▶│ specify  │───────▶│implement │─────▶│  gates   │
└─────────┘     └──────────┘        └──────────┘      └──────────┘
     │                 │                    │                 │
     │                 ▼                    ▼                 ▼
     │           ┌──────────┐        ┌──────────┐      ┌──────────┐
     └──────────▶│  clarify │        │  tasks   │      │  verify  │
                 └──────────┘        └──────────┘      └──────────┘
                      │                    │                 │
                      ▼                    ▼                 ▼
                ┌──────────┐        ┌──────────┐      ┌──────────┐
                │   plan   │        │checklist │      │   ship   │
                └──────────┘        └──────────┘      └──────────┘
```

## Core Commands

### `/speckit-spex-init`
Initialize spex structure in current project
- Creates `.specify/` directory structure
- Sets up templates and configuration
- Configures integration (claude/gemini)

### `/speckit-spex-brainstorm`
Refine rough ideas into executable specs
- Collaborative questioning
- Explore alternatives
- Incremental validation
- **Use when**: Starting with vague requirements

### `/speckit-specify`
Create or update feature specification
- Generate spec from natural language
- Update existing specs
- Follow spec-template.md structure
- **Use when**: Ready to formalize requirements

### `/speckit-clarify`
Identify underspecified areas in current spec
- Ask up to 5 targeted questions
- Encode answers back into spec
- **Use when**: Spec feels incomplete

### `/speckit-plan`
Execute implementation planning workflow
- Generate design artifacts
- Create plan.md from plan-template.md
- **Use when**: Spec approved, ready to design

### `/speckit-tasks`
Generate dependency-ordered tasks.md
- Based on plan and spec
- Actionable task breakdown
- Dependency tracking
- **Use when**: Plan complete, ready to implement

### `/speckit-implement`
Execute implementation with TDD
- Follow tasks.md order
- Test-driven development
- **Use when**: Tasks defined, ready to code

### `/speckit-checklist`
Generate verification checklist
- Based on spec requirements
- Pre-commit validation
- **Use when**: Implementation complete

## Quality Gates

### `/speckit-spex-gates-review-spec`
Review spec for soundness and completeness
- Validate specification quality
- Check implementability
- **Use when**: Spec drafted, before planning

### `/speckit-spex-gates-review-plan`
Post-planning quality validation
- Coverage matrix verification
- Red flag scanning
- Task quality enforcement
- **Use when**: Plan complete, before implementation

### `/speckit-spex-gates-review-code`
Review code against spec compliance
- Deviation tracking
- Evolution triggers
- **Use when**: Code complete, before commit

### `/speckit-spex-gates-verify`
Run full verification suite
- Spec compliance check
- Test coverage validation
- Quality metrics
- **Use when**: Ready to ship

### `/speckit-spex-gates-stamp`
Stamp feature as verified and ready
- Final approval
- Version stamping
- **Use when**: All gates passed

## Git Integration

### `/speckit-git-initialize`
Initialize git repository with spec-kit conventions
- Branch structure
- Commit templates
- **Use when**: New project setup

### `/speckit-git-feature`
Create feature branch
- Sequential or timestamp numbering
- Naming conventions
- **Use when**: Starting new feature

### `/speckit-git-commit`
Auto-commit changes after spec-kit command
- Structured commit messages
- Change tracking
- **Use when**: Workflow step complete

### `/speckit-git-validate`
Validate git state before operations
- Branch verification
- Uncommitted changes check
- **Use when**: Before major git operations

### `/speckit-git-remote`
Manage remote repository operations
- Push/pull with validation
- PR integration
- **Use when**: Syncing with remote

## Collaboration

### `/speckit-spex-collab-phase-manager`
Manage workflow phases
- Phase transitions
- State tracking
- **Use when**: Multi-phase projects

### `/speckit-spex-collab-reviewers`
Configure and manage reviewers
- Reviewer assignment
- Feedback tracking
- **Use when**: Team review process

### `/speckit-spex-collab-phase-split`
Split large features into phases
- Phase definition
- Dependency management
- **Use when**: Feature too large for single iteration

## Teams & Orchestration

### `/speckit-spex-teams-orchestrate`
Coordinate team workflows
- Task distribution
- Progress tracking
- **Use when**: Multi-developer features

### `/speckit-spex-teams-implement`
Team implementation coordination
- Parallel work management
- Integration planning
- **Use when**: Team coding phase

### `/speckit-spex-teams-research`
Coordinate research activities
- Investigation tracking
- Knowledge sharing
- **Use when**: Unknown technical areas

## Advanced

### `/speckit-spex-worktrees-manage`
Manage git worktrees for parallel work
- Worktree creation/cleanup
- Context switching
- **Use when**: Multiple features in parallel

### `/speckit-spex-flow-state`
Create/update flow state tracking
- Step-by-step workflow
- Progress persistence
- **Use when**: Complex multi-step workflows

### `/speckit-spex-deep-review-run`
Deep code and spec review
- Comprehensive analysis
- Quality deep-dive
- **Use when**: Critical features or major releases

### `/speckit-spex-spec-refactoring`
Refactor existing specs
- Spec improvement
- Structure optimization
- **Use when**: Specs need cleanup

### `/speckit-spex-evolve`
Evolve specs based on learnings
- Incorporate feedback
- Update from reality
- **Use when**: Implementation revealed gaps

### `/speckit-spex-spec-kit`
Spec management utilities
- Spec operations
- Template management
- **Use when**: Managing spec artifacts

### `/speckit-spex-extensions`
Manage spex extensions
- Extension installation
- Configuration
- **Use when**: Customizing spex workflow

## Full-Cycle Workflow

### `/speckit-spex-ship`
Autonomous full-cycle workflow
- Specify → Verify → PR
- Configurable oversight
- Auto-fix capabilities
- Optional PR creation
- **Use when**: Want end-to-end automation

## Utility Commands

### `/speckit-analyze`
Analyze current project state
- Spec status
- Implementation progress
- Quality metrics

### `/speckit-constitution`
Display or update project constitution
- Core principles
- Team agreements
- Constraints

### `/speckit-taskstoissues`
Convert tasks.md to GitHub issues
- Issue creation
- Linking and tracking
- **Use when**: Using GitHub for task management

## Common Workflows

### Starting a New Feature
1. `/speckit-spex-brainstorm` - Explore the idea
2. `/speckit-specify` - Create formal spec
3. `/speckit-clarify` - Fill gaps
4. `/speckit-spex-gates-review-spec` - Validate spec
5. `/speckit-plan` - Design implementation
6. `/speckit-spex-gates-review-plan` - Validate plan
7. `/speckit-tasks` - Break down work
8. `/speckit-implement` - Build it
9. `/speckit-spex-gates-verify` - Verify quality
10. `/speckit-spex-gates-stamp` - Mark complete

### Quick Feature (Automated)
1. `/speckit-spex-ship` - Let spex handle the whole cycle

### Fixing Implementation Gaps
1. `/speckit-spex-evolve` - Update spec from reality
2. `/speckit-plan` - Revise plan
3. `/speckit-tasks` - Update tasks
4. `/speckit-implement` - Fill gaps

### Team Feature
1. `/speckit-specify` - Define feature
2. `/speckit-spex-collab-phase-split` - Break into phases
3. `/speckit-spex-teams-orchestrate` - Coordinate
4. `/speckit-spex-teams-implement` - Execute

## Tips

- **Start small**: Use `/speckit-specify` for simple features
- **Iterate**: Use `/speckit-clarify` when unsure
- **Automate**: Use `/speckit-spex-ship` for well-understood features
- **Review early**: Run gates commands early and often
- **Track state**: Use `/speckit-analyze` to see where you are
- **Team work**: Use collab/teams commands for multi-developer features
