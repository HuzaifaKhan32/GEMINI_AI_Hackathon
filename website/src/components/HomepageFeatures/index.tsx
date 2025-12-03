import React from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type ChapterItem = {
  title: string;
  icon: string;
  description: string;
  link: string;
};

const ChapterList: ChapterItem[] = [
  {
    title: 'Chapter 1: Foundations of AI',
    icon: 'psychology',
    description: 'An introduction to the core concepts and history of artificial intelligence.',
    link: '/docs/chapter1',
  },
  {
    title: 'Chapter 2: Machine Learning',
    icon: 'model_training',
    description: 'Learn the essential algorithms and models that power modern AI systems.',
    link: '/docs/chapter2',
  },
  {
    title: 'Chapter 3: Neural Networks',
    icon: 'hub',
    description: 'Dive deep into the architecture and function of artificial neural networks.',
    link: '/docs/chapter3',
  },
  {
    title: 'Chapter 4: Computer Vision',
    icon: 'visibility',
    description: 'Explore how machines interpret and understand the visual world.',
    link: '/docs/chapter4',
  },
  {
    title: 'Chapter 5: NLP',
    icon: 'translate',
    description: 'Understand how computers process and generate human language.',
    link: '/docs/chapter5',
  },
  {
    title: 'Chapter 6: Robot Kinematics',
    icon: 'precision_manufacturing',
    description: 'Master the mathematics of robot movement and positioning.',
    link: '/docs/chapter6',
  },
  {
    title: 'Chapter 7: Motion Planning',
    icon: 'route',
    description: 'Discover algorithms for navigating robots through complex environments.',
    link: '/docs/chapter7',
  },
  {
    title: 'Chapter 8: Ethics in AI',
    icon: 'gavel',
    description: 'Consider the societal impact and ethical guidelines for developing AI.',
    link: '/docs/chapter8',
  },
];

function ChapterCard({title, icon, description, link}: ChapterItem) {
  return (
    <a href={link} className={clsx('card', styles.chapterCard)}>
      <div className={styles.chapterIconContainer}>
        <span className="material-symbols-outlined" style={{fontSize: '2.5rem'}}>{icon}</span>
      </div>
      <div className={styles.chapterTextContainer}>
        <Heading as="h3" className={styles.chapterTitle}>{title}</Heading>
        <p className={styles.chapterDescription}>{description}</p>
      </div>
    </a>
  );
}

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)} style={{
      backgroundImage: `linear-gradient(rgba(13, 27, 42, 0.7) 0%, rgba(59, 130, 246, 0.5) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDxO-F0QDOEPsSqNmpJ0N4X79ylTJnJYvDJZZ17Oiy0EOD88bT09LlPlyKHv7gFKk8lDn5dVMMlFJSxoE9t_2pxJ41kidjkfKt1um92Znv-k34EpDlDcgBKl2P0RfipaqvO9A6ucsUjfw-CUKgLZSh_w1L9zFSRwocc6_WJZmep3y6ihi_sZwYIVmso9F0vregxKr0x4oVd3mext_JTOmJSXTuIx-S8r4VmMpBGXAvStJsowaveFzdbq3RN-dOH3G7GOXuBd-lfkelK")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          AI Robotics: A Comprehensive Guide
        </Heading>
        <p className="hero__subtitle">
          Unlock the future of intelligent machines. Your journey from theory to application starts here.
        </p>
        <div className={styles.buttons}>
          <a
            className="button button--secondary button--lg"
            href="/docs/chapter1">
            Start Reading
          </a>
        </div>
      </div>
    </header>
  );
}


export default function HomepageFeatures(): JSX.Element {
  return (
    <>
      <HomepageHeader />
      <section className={styles.features}>
        <div className="container">
          <Heading as="h2" className={clsx('text--center', styles.chapterSectionTitle)}>Explore the Chapters</Heading>
          <div className="row">
            {ChapterList.map((props, idx) => (
              <div key={idx} className={clsx('col col--3', styles.chapterCardContainer)}>
                <ChapterCard {...props} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
