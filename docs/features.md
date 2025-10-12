# BowlScore Features Documentation

## Overview

BowlScore provides comprehensive tools for lawn bowlers to track performance, practice with structured drills, and maintain detailed game records. Features are divided into free and premium tiers.

## Table of Contents

1. [Authentication & User Management](#authentication--user-management)
2. [Scorecard Features](#scorecard-features)
3. [Training Drills](#training-drills)
4. [Premium Features](#premium-features)
5. [Subscription Management](#subscription-management)
6. [Feature Comparison Table](#feature-comparison-table)

---

## Authentication & User Management

### Sign Up
- **Description**: Create a new account with email and password
- **Access**: Free
- **Features**:
  - Email validation
  - Password strength requirements
  - Automatic profile creation
  - Immediate access to free features

### Sign In
- **Description**: Access existing account
- **Access**: Free
- **Features**:
  - Secure authentication
  - Remember me functionality
  - Session management
  - Automatic token refresh

### Password Reset
- **Description**: Reset forgotten password
- **Access**: Free
- **Process**:
  1. Enter email address
  2. Receive reset link via email
  3. Set new password
  4. Automatic redirect to login

### Profile Management
- **Description**: View and update user profile
- **Access**: Free
- **Features**:
  - Display name customization
  - Email address viewing
  - Subscription status display
  - Account information

---

## Scorecard Features

### Traditional Scorecard

#### Game Setup
- **Description**: Configure game parameters
- **Access**: Free
- **Options**:
  - Players per team: 1-4
  - Number of ends: 1-21
  - Team names
  - Player names
  - Handicap tracking

#### Live Scoring
- **Description**: Record scores during play
- **Access**: Free
- **Features**:
  - End-by-end scoring
  - Running totals
  - Shot-by-shot tracking
  - Automatic score calculation
  - Visual scorecard display

#### Data Persistence
- **Description**: Save and load scorecards
- **Access**: **Premium**
- **Features**:
  - Save to cloud database
  - View scorecard history
  - Load previous games
  - Preview historical scorecards

#### Export Options
- **Description**: Export scorecard data
- **Access**: Free (download), Premium (email)
- **Formats**:
  - JPEG image download (Free)
  - Email delivery (Premium)
  - High-resolution output (2x scale)

#### Reset Functions
- **Description**: Clear scorecard data
- **Access**: Free
- **Options**:
  - Reset Results: Clear scores only, keep names
  - Reset All: Clear all data and settings

### Simplified Scorecard

#### Quick Setup
- **Description**: Streamlined game configuration
- **Access**: Free
- **Features**:
  - Simplified player setup
  - Quick start interface
  - Essential options only
  - Beginner-friendly

#### Basic Scoring
- **Description**: Easy-to-use scoring interface
- **Access**: Free
- **Features**:
  - End totals
  - Running scores
  - Winner indication
  - Clean visual design

#### Export
- **Description**: Download and share
- **Access**: Free (download), Premium (email)
- **Formats**:
  - JPEG download
  - Email with attachment

---

## Training Drills

### 40 Bowls Draw Drill

#### Overview
- **Purpose**: Practice draw shots with alternating hands
- **Access**: Free (basic), Premium (history/export)
- **Format**: 10 ends, 4 bowls per end
- **Configuration**: 2 bowls per jack (long and short)

#### Features

##### Session Configuration
- Player name entry
- Date selection
- Surface type (grass/synthetic/indoor)
- Weather conditions (multiple selection)
- Session notes

##### Bowl Tracking
- **Success Marking**: Mark each bowl as successful or not
- **Miss Analysis**: Track miss types
  - Short: Bowl didn't reach target
  - Long: Bowl past target
  - Wide: Bowl too wide
  - Narrow: Bowl too narrow
- **Hand Tracking**: Automatic alternation between forehand/backhand

##### Statistics
- **Overall Stats**:
  - Total bowls thrown
  - Successful bowls
  - Success percentage
- **Miss Analysis**:
  - Count by miss type
  - Visual breakdown
- **Jack-Specific**:
  - Short jack success rate
  - Long jack success rate
- **Hand-Specific**:
  - Forehand performance
  - Backhand performance
  - Split by jack length

##### Premium Features
- Session history viewing
- Save sessions to cloud
- Load previous sessions
- Email results
- Download high-res JPEG

##### User Experience
- Color-coded bowl results (green = success, red = miss)
- Visual grid layout
- Alternating hand indicators
- Real-time statistics updates
- Session notes for context

---

### Lead vs Lead Drill

#### Overview
- **Purpose**: Competitive lead practice
- **Access**: Free (basic), Premium (history/export)
- **Format**: Head-to-head between two players
- **Scoring**: Points system with penalties

#### Features

##### Game Setup
- Player A and B names
- Date selection
- Surface type
- Weather conditions (multiple)
- Bowls per player (2-4)
- Number of ends (1-21)

##### Bowl Tracking Per End
- **Good Shots**: Mark successful bowls
- **Crossed Line**: Penalty marking
- **Short**: Bowl didn't reach head
- **Mutual Exclusivity**: Can't mark as both good and penalty

##### End Completion
- **Shot Winner Selection**: Choose which player won shot
- **Shots Won**: Number of shots won (1 to bowls per player)
- **Scoring System**:
  - Winner gets: shots won × 3 points
  - Penalties deducted: -1 per crossed/short bowl
  - Running cumulative score

##### Statistics
- **Per Player**:
  - Total good shots held
  - Total penalties (crossed + short)
  - Penalty breakdown
  - Final score
- **Game Results**:
  - Winner determination
  - Score differential
  - Performance summary

##### Premium Features
- Save game to history
- View previous games
- Load historical games
- Download as JPEG
- Email results

##### User Experience
- Clear end-by-end progression
- Shot winner selection screen
- Running scorecard display
- Visual penalty indicators
- Confirmation before moving to next end

---

### 2nd's Chance Drill

#### Overview
- **Purpose**: Practice consistency on both hands
- **Access**: Free (basic), Premium (history/export)
- **Format**: Alternating hand drill with strict criteria
- **Bowls**: 2 or 4 bowls per player per end

#### Features

##### Game Setup
- Player A and B names
- Date selection
- Surface type
- Weather conditions
- Bowls per player (2 or 4)
- Number of ends

##### Hand Alternation Logic
- **Odd Ends**: Player A starts forehand, Player B starts backhand
- **Even Ends**: Player A starts backhand, Player B starts forehand
- **Automatic Switching**: System handles hand assignment per bowl
- **Visual Indicators**: Clear FH/BH badges on each bowl

##### Success Criteria
- **First Bowl (per hand)**:
  - Between jack and 2m beyond
  - Within mat length to side
  - No crossing center line
- **Second Bowl (per hand)**:
  - Within mat length of jack
  - Less strict than first bowl

##### Bowl Tracking
- Success checkbox per bowl
- Hand indicator (FH/BH) per bowl
- Criteria displayed for each bowl
- Clear success/failure marking

##### Statistics
- **Overall**:
  - Total successful bowls
  - Success rate percentage
  - Final scores
- **Hand-Specific**:
  - Forehand successes
  - Backhand successes
  - Per-player breakdown
- **Game Results**:
  - Winner determination
  - Performance comparison

##### Premium Features
- Save sessions to history
- View previous sessions
- Load historical sessions
- Download JPEG
- Email results

##### User Experience
- Auto-rotating hand assignments
- Clear success criteria per bowl
- Visual hand indicators
- End preview before finalization
- Next end hand rotation preview

---

## Premium Features

### What's Included

#### Drill History
- **40 Bowls Draw**: Unlimited session storage
- **Lead vs Lead**: Unlimited game storage
- **2nd's Chance**: Unlimited session storage
- **Access**: View, load, and analyze past sessions
- **Preview**: Image previews of past sessions

#### Data Export
- **Download**: High-resolution JPEG exports
- **Email**: Direct email delivery with attachments
- **Format**: Professional scorecard layout
- **Quality**: 2x scale for crisp printing

#### Session Saving
- **Automatic Cloud Storage**: All sessions saved
- **Quick Retrieval**: Fast access to history
- **No Limits**: Unlimited storage
- **Organized**: Sorted by date

#### Email Functionality
- **Scorecards**: Email traditional scorecards
- **Drill Results**: Email all drill session results
- **Attachments**: JPEG image attached
- **Customizable**: Add recipient email
- **Professional**: Formatted email content

### Premium vs Free

| Feature | Free | Premium |
|---------|------|---------|
| Traditional Scorecard | ✓ | ✓ |
| Simplified Scorecard | ✓ | ✓ |
| All Training Drills | ✓ | ✓ |
| Local JPEG Download | ✓ | ✓ |
| Session History | ✗ | ✓ |
| Save to Cloud | ✗ | ✓ |
| Email Results | ✗ | ✓ |
| Unlimited Storage | ✗ | ✓ |
| Priority Support | ✗ | ✓ |

---

## Subscription Management

### Subscription Plans

#### Free Trial
- **Duration**: Configurable (default 7 days)
- **Access**: Full premium features
- **Limitations**: None during trial
- **Conversion**: Automatic to paid or free tier

#### Premium Monthly
- **Price**: Set via Stripe
- **Billing**: Monthly recurring
- **Access**: All premium features
- **Cancellation**: Anytime, access until period end

### Payment Processing

#### Checkout Flow
1. User clicks "Upgrade to Premium"
2. Redirected to Stripe Checkout
3. Enter payment details
4. Payment processed securely
5. Redirect to success page
6. Premium features activated immediately

#### Supported Payment Methods
- Credit cards (Visa, Mastercard, Amex)
- Debit cards
- Additional methods via Stripe

### Subscription Status

#### Active States
- **Active**: Paid subscription, full access
- **Trialing**: In trial period, full access
- **Past Due**: Payment failed, temporary access
- **Canceled**: Canceled, access until period end
- **Inactive**: No subscription, free features only

#### Status Display
- Dashboard shows current status
- Subscription expiry date
- Renewal information
- Cancellation confirmation

### Discount System

#### Request Process
1. Click "Request Discount"
2. Fill out form:
   - Name
   - Email
   - Reason for request
3. Submit request
4. Admin reviews
5. If approved, receive promo code via email

#### Approval Process
- Admin receives email notification
- Review request details
- Click approve link
- System generates Stripe coupon
- User receives promo code email
- User applies code at checkout

---

## Feature Comparison Table

### Scorecards

| Feature | Traditional | Simplified |
|---------|-------------|------------|
| Player Setup | Advanced | Simple |
| Team Support | Yes (1-4 per team) | Yes (2 teams) |
| Handicaps | Yes | No |
| End Configuration | 1-21 ends | Flexible |
| Live Scoring | Yes | Yes |
| Running Totals | Yes | Yes |
| Save/Load | Premium | Premium |
| JPEG Export | Free | Free |
| Email | Premium | Premium |

### Training Drills

| Feature | 40 Bowls | Lead vs Lead | 2nd's Chance |
|---------|----------|--------------|--------------|
| Players | 1 | 2 | 2 |
| Hands Tracked | Both (alternating) | N/A | Both (alternating) |
| Success Criteria | Basic | Points system | Strict criteria |
| Miss Analysis | Detailed | Penalties | Yes/No |
| Statistics | Comprehensive | Moderate | Hand-specific |
| History | Premium | Premium | Premium |
| Export | Premium | Premium | Premium |
| Email | Premium | Premium | Premium |

---

## User Workflows

### First-Time User Journey

1. **Landing Page**
   - View features
   - See pricing
   - Click "Get Started"

2. **Sign Up**
   - Create account
   - Verify email
   - Automatic profile creation

3. **Explore Free Features**
   - Try traditional scorecard
   - Try simplified scorecard
   - Test all drills (without saving)

4. **Upgrade Decision**
   - View premium features
   - Start trial or subscribe
   - Full access immediately

### Returning User Journey

1. **Sign In**
   - Enter credentials
   - Access dashboard

2. **Choose Activity**
   - Start new scorecard
   - Continue drill practice
   - Review history (if premium)

3. **Complete Activity**
   - Record scores/results
   - Save session (if premium)
   - Export or email results

### Premium User Journey

1. **Access Advanced Features**
   - Save sessions automatically
   - Build performance history
   - Track progress over time

2. **Analyze Performance**
   - Review past sessions
   - Compare statistics
   - Identify trends

3. **Share Results**
   - Email to coach
   - Email to teammates
   - Download for records

---

## Feature Request Process

### How to Request Features

1. **Via Feedback Form**
   - Click "Feedback" button
   - Describe feature
   - Submit request

2. **Via Email**
   - Contact support
   - Provide details
   - Include use case

### Feature Prioritization

Features are prioritized based on:
- User demand
- Technical complexity
- Strategic alignment
- Resource availability

---

## Known Limitations

### Current Limitations

1. **No Offline Mode**
   - Requires internet connection
   - No local data sync

2. **No Mobile Apps**
   - Web-only currently
   - Mobile-responsive design

3. **Limited Social Features**
   - No team sharing
   - No leaderboards

4. **No Video Analysis**
   - Text and image only
   - No form analysis

5. **English Only**
   - No internationalization
   - Single language support

### Planned Improvements

See [bowlscore-roadmap.md](./bowlscore-roadmap.md) for future feature plans.

---

## Support & Help

### Getting Help

- **Documentation**: Read these docs
- **Feedback Form**: Submit questions
- **Email Support**: Contact team
- **FAQ**: Coming soon

### Troubleshooting

#### Can't Save Sessions
- Check if logged in
- Verify premium subscription
- Check internet connection
- Try refreshing page

#### Export Not Working
- Ensure scorecard is complete
- Check browser permissions
- Try different browser
- Clear browser cache

#### Subscription Issues
- Verify payment method
- Check subscription status
- Contact support if needed
- Review billing portal

---

## Accessibility Features

### Current Support

- Keyboard navigation
- Semantic HTML
- Clear visual hierarchy
- High contrast colors
- Readable fonts

### Future Enhancements

- Screen reader optimization
- ARIA labels improvement
- Focus management
- Keyboard shortcuts
- Color blind modes

---

## Browser Compatibility

### Supported Browsers

- **Chrome**: Latest 2 versions ✓
- **Firefox**: Latest 2 versions ✓
- **Safari**: Latest 2 versions ✓
- **Edge**: Latest 2 versions ✓

### Mobile Support

- **iOS Safari**: iOS 14+ ✓
- **Chrome Mobile**: Latest ✓
- **Firefox Mobile**: Latest ✓
- **Samsung Internet**: Latest ✓

### Recommended

- Latest Chrome or Firefox
- Screen size: 1024px+ for optimal experience
- JavaScript enabled
- Cookies enabled

---

## Performance

### Optimization

- Lazy loading for images
- Optimized bundle size
- Fast page loads
- Responsive interactions
- Minimal API calls

### Metrics

- First Contentful Paint: <2s
- Time to Interactive: <3s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1

---

This documentation is maintained and updated with each release. For the most current information, always refer to the latest version.
